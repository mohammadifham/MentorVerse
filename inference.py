import os
from openai import OpenAI

API_BASE_URL = os.getenv("API_BASE_URL", "https://api-inference.huggingface.co/v1")
MODEL_NAME = os.getenv("MODEL_NAME", "mistralai/Mistral-7B-Instruct")
HF_TOKEN = os.getenv("HF_TOKEN")
LOCAL_IMAGE_NAME = os.getenv("LOCAL_IMAGE_NAME")


def _log_start(message: str) -> None:
    print(f"[START] {message}")


def _log_step(message: str) -> None:
    print(f"[STEP] {message}")


def _log_end(message: str) -> None:
    print(f"[END] {message}")


def _client() -> OpenAI:
    _log_start("Initialize OpenAI-compatible client")
    _log_step(f"API_BASE_URL={API_BASE_URL}")
    _log_step(f"MODEL_NAME={MODEL_NAME}")

    if not HF_TOKEN:
        _log_end("ERROR: HF_TOKEN is not set")
        raise RuntimeError("HF_TOKEN is required")

    client = OpenAI(api_key=HF_TOKEN, base_url=API_BASE_URL)
    _log_end("Client initialized")
    return client


def run_inference(prompt: str, system_prompt: str | None = None, max_tokens: int = 220) -> str:
    _log_start("Run inference")
    _log_step(f"prompt_len={len(prompt)}")
    _log_step(f"system_prompt={'yes' if system_prompt else 'no'}")

    client = _client()
    messages = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        max_tokens=max_tokens,
        temperature=0.7,
    )

    text = (response.choices[0].message.content or "").strip()
    _log_step(f"output_len={len(text)}")
    _log_end("Inference complete")
    return text


if __name__ == "__main__":
    sample_prompt = "Explain binary search in 3 short bullet points."
    print(run_inference(sample_prompt))
