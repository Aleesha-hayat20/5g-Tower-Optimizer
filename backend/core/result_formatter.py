def sanitize_metrics(metrics: dict) -> dict:
    """
    Convert numpy arrays and heavy internal objects into JSON-safe lightweight metrics.
    """

    cleaned = {
        "total_covered_population": int(metrics.get("total_covered_population", 0)),
        "coverage_percent": float(metrics.get("coverage_percent", 0.0)),
        "avg_snr_db": float(metrics.get("avg_snr_db", 0.0)),
        "interference_score": float(metrics.get("interference_score", 0.0)),
        "overlap_percent": float(metrics.get("overlap_percent", 0.0)),
        "per_tower_coverage": []
    }

    for tower in metrics.get("per_tower_coverage", []):
        cleaned["per_tower_coverage"].append({
            "covered_population": int(tower.get("covered_population", 0)),
            "coverage_percent": float(tower.get("coverage_percent", 0.0)),
            "avg_snr_db": float(tower.get("avg_snr_db", 0.0)),
            "coverage_radius_m": float(tower.get("coverage_radius_m", 0.0))
        })

    return cleaned