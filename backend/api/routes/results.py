from fastapi import APIRouter, HTTPException
from core.cache_manager import list_cached_results, load_cached_result

router = APIRouter()


@router.get("/results")
def get_all_results():
    return {"cached_runs": list_cached_results()}


@router.get("/results/{filename}")
def get_result_file(filename: str):
    result = load_cached_result(filename)

    if result is None:
        raise HTTPException(status_code=404, detail="Result file not found")

    return result