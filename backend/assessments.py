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


def probability_percent(value):
    if isinstance(value, bool):
        raise ValueError("Probability must be a finite percentage from 0 to 100")
    probability = float(value)
    if not math.isfinite(probability) or not 0 <= probability <= 100:
        raise ValueError("Probability must be a finite percentage from 0 to 100")
    return probability


def required_identity(value, field, maximum):
    if not isinstance(value, str) or not value.strip() or len(value) > maximum:
        raise ValueError(f"{field} must be a nonblank string of at most {maximum} characters")
    return value


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

        student_id = required_identity(student_id, "Student ID", 128)
        student_name = required_identity(student_name, "Student name", 200)

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
                probability_percent(
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
                    )
                ),

            "interventions":
                json.dumps(
                    data.get(
                        "interventions",
                        [],
                    )
                ),

            "student_data":
                json.dumps(
                    data.get(
                        "student_data",
                        {},
                    )
                ),

            "created_at":
                data.get(
                    "created_at",
                    datetime.now().isoformat(),
                ),
        }

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

    except Exception as error:
        return {
            "error":
                "Could not save assessment.",

            "detail":
                str(error),
        }
