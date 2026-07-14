import subprocess
import tempfile
import os
import uuid
import json


TRACE_WRAPPER_TEMPLATE = '''
import sys
import json as _json

_trace_steps = []
_MAX_STEPS = 200

_user_code = {embedded_code}

def _is_json_safe(value):
    try:
        _json.dumps(value)
        return True
    except (TypeError, ValueError):
        return False

def _tracer(frame, event, arg):
    if event == "line" and frame.f_code.co_filename == "<user_code>":
        if len(_trace_steps) < _MAX_STEPS:
            safe_vars = {{
                k: v for k, v in frame.f_locals.items()
                if not k.startswith("_") and _is_json_safe(v)
            }}
            _trace_steps.append({{
                "line": frame.f_lineno,
                "variables": safe_vars
            }})
    return _tracer

_compiled = compile(_user_code, "<user_code>", "exec")

sys.settrace(_tracer)
try:
    exec(_compiled, {{}})
finally:
    sys.settrace(None)

print("___TRACE_START___")
print(_json.dumps(_trace_steps))
'''


class ExecutionTracer:
    def __init__(self, timeout_seconds: int = 5):
        self.timeout_seconds = timeout_seconds

    def trace_execution(self, code: str, input_data: str = "") -> dict:
        """
        Runs Python code with line-by-line tracing enabled.
        Uses repr() to safely embed the user's code as a Python string literal
        (avoids double-escaping issues between JSON and Python string parsing).
        """
        temp_dir = tempfile.gettempdir()
        filename = f"trace_{uuid.uuid4().hex}.py"
        filepath = os.path.join(temp_dir, filename)

        embedded_code = repr(code)

        wrapped_code = TRACE_WRAPPER_TEMPLATE.format(embedded_code=embedded_code)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(wrapped_code)

        try:
            result = subprocess.run(
                ["python", filepath],
                input=input_data,
                capture_output=True,
                text=True,
                timeout=self.timeout_seconds
            )

            full_output = result.stdout

            if "___TRACE_START___" in full_output:
                program_output, trace_json = full_output.split("___TRACE_START___")
                try:
                    trace_steps = json.loads(trace_json.strip())
                except json.JSONDecodeError:
                    trace_steps = []
            else:
                program_output = full_output
                trace_steps = []

            return {
                "success": result.returncode == 0,
                "output": program_output.strip(),
                "error": result.stderr.strip() if result.stderr else None,
                "trace": trace_steps
            }

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "output": "",
                "error": "Time Limit Exceeded",
                "trace": []
            }
        finally:
            if os.path.exists(filepath):
                os.remove(filepath)


execution_tracer = ExecutionTracer()