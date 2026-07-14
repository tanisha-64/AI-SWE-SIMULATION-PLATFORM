from abc import ABC, abstractmethod


class BaseAgent(ABC):
    """
    Abstract base class for all agents.
    Every agent follows a plan -> act (use tools) -> synthesize pattern.
    """

    @abstractmethod
    def run(self, *args, **kwargs) -> dict:
        """Executes the agent's multi-step reasoning process."""
        pass