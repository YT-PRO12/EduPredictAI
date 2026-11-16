"""Assessment creation with server-owned identifiers, independent of ML startup."""
from datetime import datetime
import json
import math

from backend.database import insert_assessment
from backend.identifiers import new_assessment_id


def get_status(risk_level: str):
    if risk_level == "HIGH":
        return "Needs attention"

    if risk_level == "MEDIUM":
        return "Monitoring"

    return "Stable"


def get_monitoring_frequency(
    risk_level: str,
):
    if risk_level == "HIGH":
        return "Weekly"

    if risk_level == "MEDIUM":
        return "Every 2 weeks"

    return "Monthly"


def create_assessment(data: dict):
    try:
        assessment_id = new_assessment_id()

        student_id = data.get(
            "student_id",
            assessment_id,
        )

        student_name = data.get(
            "student_name",
            "Student",
        )

        risk = data.get(
            "risk",
            "LOW",
        )

        assessment = {
            "id":
                assessment_id,

            "student_id":
                student_id,

            "student_name":
                student_name,

            "course":
                data.get("course"),

            "year":
                data.get("year"),

            "probability":
                float(
                    data.get(
                        "probability",
                        0,
                    )
                ),

            "risk":
                risk,

            "status":
                data.get(
                    "status",
                    get_status(risk),
                ),

            "monitoring":
                data.get(
                    "monitoring",
                    get_monitoring_frequency(
                        risk
                    ),
                ),

            "risk_factors":
                json.dumps(
                    data.get(
                        "risk_factors",
                        [],
                    ),
                    allow_nan=False,
                ),

            "interventions":
                json.dumps(
                    data.get(
                        "interventions",
                        [],
                    ),
                    allow_nan=False,
                ),

            "student_data":
                json.dumps(
                    data.get(
                        "student_data",
                        {},
                    ),
                    allow_nan=False,
                ),

            "created_at":
                data.get(
                    "created_at",
                    datetime.now().isoformat(),
                ),
        }

        # Preserve the existing API contract: fractional inputs (0..1) and
        # legacy percentage-style inputs (1..100) are stored unchanged.
        # Consumers must know the producer's scale before interpretation.
        if not math.isfinite(assessment["probability"]) or not (
            0.0 <= assessment["probability"] <= 100.0
        ):
            raise ValueError("Assessment score must be finite and within 0..100")

        insert_assessment(
            assessment
        )

        return {
            "message":
                "Assessment saved successfully",

            "id":
                assessment_id,

            "student_id":
                student_id,
        }

    except Exception:
        return {
            "error":
                "Could not save assessment.",

            "detail":
                "Internal persistence error.",
        }
