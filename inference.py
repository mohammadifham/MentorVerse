"""Inference entrypoint for OpenEnv-style evaluation.

Uses OpenAI-compatible chat completions endpoint configured by environment
variables so it can target Hugging Face Inference or other compatible APIs.
"""

from __future__ import annotations

import os
from typing import Any

from openai import OpenAI


def _require_env(name: str) -> str:
	value = os.getenv(name, "").strip()
	if not value:
		raise ValueError(f"Missing required environment variable: {name}")
	return value


def run_inference(prompt: str) -> str:
	"""Generate a response for a prompt.

	Required env vars:
	- OPENAI_BASE_URL
	- OPENAI_API_KEY
	- OPENAI_MODEL
	"""
	print("START: run_inference")

	print("STEP: validating_environment")
	base_url = _require_env("OPENAI_BASE_URL")
	api_key = _require_env("OPENAI_API_KEY")
	model = _require_env("OPENAI_MODEL")

	print("STEP: creating_client")
	client = OpenAI(base_url=base_url, api_key=api_key)

	print("STEP: sending_request")
	completion = client.chat.completions.create(
		model=model,
		messages=[
			{
				"role": "system",
				"content": "You are a concise, helpful coding mentor.",
			},
			{"role": "user", "content": prompt},
		],
		temperature=0.2,
		max_tokens=512,
	)

	print("STEP: parsing_response")
	text = completion.choices[0].message.content or ""

	print("END: run_inference")
	return text.strip()


def handler(input_data: dict[str, Any]) -> dict[str, Any]:
	"""Optional wrapper for external runners expecting a dict payload."""
	prompt = str(input_data.get("prompt", "")).strip()
	if not prompt:
		return {"error": "Missing prompt"}
	try:
		output = run_inference(prompt)
		return {"output": output}
	except Exception as exc:  # pragma: no cover - defensive for runtime envs
		return {"error": str(exc)}
