"""Inference entrypoint for submission evaluation.

Uses an OpenAI-compatible client configured by API_BASE_URL, MODEL_NAME,
and HF_TOKEN, and emits structured stdout logs in the required format.
"""

from __future__ import annotations

import argparse
import os
import sys
from typing import Any

from openai import OpenAI


def _normalize_api_base_url(value: str | None) -> str:
    base_url = (value or "https://router.huggingface.co/v1").strip()
    if "api-inference.huggingface.co" in base_url:
        return base_url.replace("https://api-inference.huggingface.co", "https://router.huggingface.co")
    return base_url


API_BASE_URL = _normalize_api_base_url(os.getenv("API_BASE_URL"))
MODEL_NAME = os.getenv("MODEL_NAME", "mistralai/Mistral-7B-Instruct")
HF_TOKEN = os.getenv("HF_TOKEN")


def log_start(message: str) -> None:
    print(f"[START] {message}")


def log_step(message: str) -> None:
    print(f"[STEP] {message}")


def log_end(message: str) -> None:
    print(f"[END] {message}")


def validate_environment_variables() -> None:
    log_start("Environment Variables Validation")

    missing_vars: list[str] = []
    if not MODEL_NAME:
        missing_vars.append("MODEL_NAME")
    if not HF_TOKEN:
        missing_vars.append("HF_TOKEN")

    log_step(f"API_BASE_URL: {API_BASE_URL}")
    log_step(f"MODEL_NAME: {MODEL_NAME}")
    log_step(f"HF_TOKEN: {'configured' if HF_TOKEN else 'NOT SET'}")

    if missing_vars:
        log_end(f"ERROR: Missing required environment variables: {', '.join(missing_vars)}")
        raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")

    log_end("All required environment variables are properly configured")


def initialize_client() -> OpenAI:
    if not HF_TOKEN:
        log_start("OpenAI Client Initialization")
        log_step("Validating environment variables")
        log_end("ERROR: HF_TOKEN environment variable is required but not set")
        raise ValueError("HF_TOKEN environment variable is required")

    log_start("OpenAI Client Initialization")
    log_step(f"Using API Base URL: {API_BASE_URL}")
    log_step(f"Using Model: {MODEL_NAME}")
    log_step("HF_TOKEN is configured")

    client = OpenAI(api_key=HF_TOKEN, base_url=API_BASE_URL)
    log_end("OpenAI Client initialized successfully")
    return client


def candidate_models() -> list[str]:
    candidates = [
        MODEL_NAME,
        "meta-llama/Llama-3.1-8B-Instruct",
        "Qwen/Qwen2.5-7B-Instruct",
        "openai/gpt-oss-20b",
    ]
    ordered: list[str] = []
    for model_name in candidates:
        if model_name and model_name not in ordered:
            ordered.append(model_name)
    return ordered


def run_inference(prompt: str, system_prompt: str | None = None, max_tokens: int = 220) -> str:
    log_start(f"Inference Request: {prompt[:100]}...")

    try:
        client = initialize_client()

        log_step("Preparing request to LLM")
        log_step(f"System Prompt: {'Provided' if system_prompt else 'None'}")
        log_step(f"Max Tokens: {max_tokens}")

        messages: list[dict[str, str]] = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        log_step("Sending request to OpenAI-compatible API")
        response = None
        last_error: Exception | None = None
        for model_name in candidate_models():
            log_step(f"Attempting model: {model_name}")
            try:
                response = client.chat.completions.create(
                    model=model_name,
                    messages=messages,
                    max_tokens=max_tokens,
                    temperature=0.7,
                )
                log_step("Received response from API")
                break
            except Exception as error:
                last_error = error
                error_text = str(error)
                if (
                    "model_not_found" in error_text
                    or "model_not_supported" in error_text
                    or "does not exist" in error_text
                    or "not supported by any provider" in error_text
                ):
                    log_step(f"Model unavailable: {model_name}")
                    continue
                raise

        if response is None:
            assert last_error is not None
            raise last_error

        generated_text = response.choices[0].message.content or "No response generated"
        generated_text = generated_text.strip()
        log_step(f"Generated text length: {len(generated_text)} characters")
        log_end("Inference completed successfully")
        return generated_text
    except Exception as error:  # pragma: no cover - defensive for submission runtime
        error_message = error if isinstance(error, str) else str(error)
        log_step(f"Error occurred: {error_message}")
        log_end("Inference failed")
        raise


def handler(input_data: dict[str, Any]) -> dict[str, Any]:
    prompt = str(input_data.get("prompt", "")).strip()
    system_prompt = input_data.get("system_prompt")
    max_tokens = int(input_data.get("max_tokens", 220))

    if not prompt:
        return {"error": "Missing prompt"}

    try:
        output = run_inference(prompt, str(system_prompt) if system_prompt else None, max_tokens)
        return {"output": output}
    except Exception as exc:
        return {"error": str(exc)}


def main() -> int:
    parser = argparse.ArgumentParser(description="Run MentorVerse inference")
    parser.add_argument("prompt", nargs="?", default="Explain binary search in one paragraph.")
    parser.add_argument("--system-prompt", default=None)
    parser.add_argument("--max-tokens", type=int, default=220)
    args = parser.parse_args()

    validate_environment_variables()
    output = run_inference(args.prompt, args.system_prompt, args.max_tokens)
    print(output)
    return 0


if __name__ == "__main__":
    sys.exit(main())