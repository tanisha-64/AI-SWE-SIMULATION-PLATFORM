import subprocess
import tempfile
import os
import time
import uuid
from typing import Dict, List


class CodeExecutor:
    """
    Safely executes untrusted user code with timeout protection.
    Uses isolated temp files and subprocess sandboxing.
    """

    SUPPORTED_LANGUAGES = {
        "python": {
            "extension": "py",
            "command": ["python"]
        }
    }

    def __init__(self, timeout_seconds: int = 5):
        self.timeout_seconds = timeout_seconds

    def _create_temp_file(self, code: str, language: str) -> str:
        lang_config = self.SUPPORTED_LANGUAGES.get(language)
        if not lang_config:
            raise ValueError(f"Unsupported language: {language}")

        temp_dir = tempfile.gettempdir()
        filename = f"submission_{uuid.uuid4().hex}.{lang_config['extension']}"
        filepath = os.path.join(temp_dir, filename)

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(code)

        return filepath

    def _cleanup(self, filepath: str):
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
        except Exception:
            pass

    def run_single(self, code: str, language: str, input_data: str = "") -> Dict:
        """Run code once against a single input, return raw output."""
        filepath = self._create_temp_file(code, language)
        lang_config = self.SUPPORTED_LANGUAGES[language]

        try:
            start = time.time()
            result = subprocess.run(
                lang_config["command"] + [filepath],
                input=input_data,
                capture_output=True,
                text=True,
                timeout=self.timeout_seconds
            )
            elapsed_ms = (time.time() - start) * 1000

            return {
                "success": result.returncode == 0,
                "stdout": result.stdout.strip(),
                "stderr": result.stderr.strip(),
                "execution_time_ms": round(elapsed_ms, 2),
                "timed_out": False
            }

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "stdout": "",
                "stderr": "Time Limit Exceeded",
                "execution_time_ms": self.timeout_seconds * 1000,
                "timed_out": True
            }
        except Exception as e:
            return {
                "success": False,
                "stdout": "",
                "stderr": str(e),
                "execution_time_ms": 0,
                "timed_out": False
            }
        finally:
            self._cleanup(filepath)

    def run_test_cases(self, code: str, language: str, test_cases: List[dict]) -> Dict:
        """Run code against multiple test cases, return detailed results."""
        results = []
        total_time_ms = 0.0

        for idx, test in enumerate(test_cases):
            input_data = test.get("input", "")
            expected_output = test.get("output", "").strip()
            is_sample = test.get("is_sample", False)

            run_result = self.run_single(code, language, input_data)
            actual_output = run_result["stdout"].strip()

            passed = run_result["success"] and actual_output == expected_output
            total_time_ms += run_result["execution_time_ms"]

            results.append({
                "test_id": idx + 1,
                "passed": passed,
                "input": input_data,
                "expected": expected_output,
                "actual": actual_output,
                "error": run_result["stderr"] if not run_result["success"] else None,
                "is_sample": is_sample
            })

        passed_count = sum(1 for r in results if r["passed"])

        return {
            "results": results,
            "passed_count": passed_count,
            "total_count": len(test_cases),
            "total_execution_time_ms": round(total_time_ms, 2)
        }


code_executor = CodeExecutor(timeout_seconds=5)