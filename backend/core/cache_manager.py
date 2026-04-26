import os
import json
from datetime import datetime


CACHE_DIR = "results_cache"
os.makedirs(CACHE_DIR, exist_ok=True)


def save_result(city: str, result_payload: dict) -> str:
    """
    Save optimization result to JSON cache file.
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{city}_{timestamp}.json"
    filepath = os.path.join(CACHE_DIR, filename)

    with open(filepath, "w") as f:
        json.dump(result_payload, f, indent=2)

    return filename


def list_cached_results():
    files = [f for f in os.listdir(CACHE_DIR) if f.endswith('.json')]
    # Sort by modification time, newest first
    files.sort(key=lambda x: os.path.getmtime(os.path.join(CACHE_DIR, x)), reverse=True)
    return files


def load_cached_result(filename: str):
    filepath = os.path.join(CACHE_DIR, filename)

    if not os.path.exists(filepath):
        return None

    with open(filepath, "r") as f:
        return json.load(f)


def delete_cached_result(filename: str) -> bool:
    """
    Delete a cached result file.
    """
    filepath = os.path.join(CACHE_DIR, filename)
    if os.path.exists(filepath):
        os.remove(filepath)
        return True
    return False