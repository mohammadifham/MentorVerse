from __future__ import annotations

from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class Action(BaseModel):
    prompt: str = Field(default="", description="User prompt to evaluate")
    system_prompt: Optional[str] = Field(default=None, description="Optional system prompt")
    max_tokens: int = Field(default=220, ge=1, le=4096, description="Maximum tokens")


class Observation(BaseModel):
    text: str = Field(default="", description="Generated response")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")


class State(BaseModel):
    episode_id: str = Field(default="mentorverse-episode", description="Episode identifier")
    step_count: int = Field(default=0, ge=0, description="Number of steps taken")
    last_prompt: str = Field(default="", description="Most recent prompt")


class StepResult(BaseModel):
    observation: Observation
    reward: float = Field(default=0.0, ge=0.0, le=1.0)
    done: bool = Field(default=False)
    state: State
