from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import requests

from models import Action, Observation, State, StepResult


@dataclass
class MentorVerseEnv:
    base_url: str

    def reset(self) -> dict[str, Any]:
        response = requests.post(f"{self.base_url.rstrip('/')}/reset", timeout=10)
        response.raise_for_status()
        return response.json()

    def step(self, action: Action) -> dict[str, Any]:
        response = requests.post(
            f"{self.base_url.rstrip('/')}/step",
            json=action.model_dump(),
            timeout=10,
        )
        response.raise_for_status()
        return response.json()

    def state(self) -> dict[str, Any]:
        response = requests.get(f"{self.base_url.rstrip('/')}/state", timeout=10)
        response.raise_for_status()
        return response.json()
