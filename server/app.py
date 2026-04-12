from __future__ import annotations

from typing import Any

from fastapi import FastAPI
import uvicorn

from .models import Action, Observation, State, StepResult


app = FastAPI(title="MentorVerse OpenEnv Shim")

_STATE = State()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "healthy"}


@app.get("/metadata")
def metadata() -> dict[str, str]:
    return {
        "name": "mentorverse",
        "description": "MentorVerse OpenEnv compatibility shim for validation.",
    }


@app.post("/reset")
def reset() -> dict[str, Any]:
    global _STATE
    _STATE = State()
    observation = Observation(
        text="MentorVerse environment ready.",
        metadata={"episode_id": _STATE.episode_id, "step_count": _STATE.step_count},
    )
    return {"observation": observation.model_dump(), "state": _STATE.model_dump()}


@app.post("/step")
def step(action: Action) -> dict[str, Any]:
    global _STATE
    _STATE.step_count += 1
    _STATE.last_prompt = action.prompt
    observation = Observation(
        text=f"Received prompt: {action.prompt}",
        metadata={"system_prompt": action.system_prompt, "max_tokens": action.max_tokens},
    )
    result = StepResult(
        observation=observation,
        reward=1.0 if action.prompt.strip() else 0.0,
        done=False,
        state=_STATE,
    )
    return result.model_dump()


@app.get("/state")
def state() -> dict[str, Any]:
    return _STATE.model_dump()


def main() -> None:
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
