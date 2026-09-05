from datetime import datetime
import json

from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware

from backend.database import (
    initialize_database,
    insert_assessment,
    get_all_assessments,
    get_student_assessments,
    initialize_interventions_table,
    save_student_interventions,
    get_student_interventions,
)

from backend.model import (
    model,
    predict_dropout,
    generate_intervention_plan,
)

from backend.explainability import (
    explain_student,
)


app = FastAPI(
    title="EduPredict AI",
    description="Explainable student dropout early-warning API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


initialize_database()
initialize_interventions_table()


def normalize_student_data(data: dict):
    mapping = {
        "marital_status":
            "Marital status",

        "application_mode":
            "Application mode",

        "application_order":
            "Application order",

        "course":
            "Course",

        "daytime_evening_attendance":
            "Daytime/evening attendance",

        "previous_qualification":
            "Previous qualification",

        "previous_qualification_grade":
            "Previous qualification (grade)",

        "nacionality":
            "Nacionality",

        "mothers_qualification":
            "Mother's qualification",

        "fathers_qualification":
            "Father's qualification",

        "mothers_occupation":
            "Mother's occupation",

        "fathers_occupation":
            "Father's occupation",

        "admission_grade":
            "Admission grade",

        "displaced":
            "Displaced",

        "educational_special_needs":
            "Educational special needs",

        "debtor":
            "Debtor",

        "tuition_fees_up_to_date":
            "Tuition fees up to date",

        "gender":
            "Gender",

        "scholarship_holder":
            "Scholarship holder",

        "age_at_enrollment":
            "Age at enrollment",

        "international":
            "International",

        "unemployment_rate":
            "Unemployment rate",

        "inflation_rate":
            "Inflation rate",

        "gdp":
            "GDP",
    }

    normalized = {}

    for key, value in data.items():
        if key in mapping:
            normalized[mapping[key]] = value
        else:
            normalized[key] = value

    return normalized


def get_risk_level(probability: float):
    if probability >= 0.60:
        return "HIGH"

    if probability >= 0.40:
        return "MEDIUM"

    return "LOW"


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


def normalize_probability(value):
    probability = float(value)

    if probability > 1:
        probability /= 100

    return max(
        0.0,
        min(probability, 1.0),
    )


def normalize_risk_factors(factors):
    if not factors:
        return []

    result = []

    for factor in factors:
        if not isinstance(
            factor,
            dict,
        ):
            continue

        feature = factor.get(
            "feature",
            "Unknown factor",
        )

        contribution = factor.get(
            "contribution",
            0,
        )

        try:
            contribution = float(
                contribution
            )
        except (
            TypeError,
            ValueError,
        ):
            contribution = 0.0

        if contribution > 0:
            direction = "increases_risk"

        elif contribution < 0:
            direction = "decreases_risk"

        else:
            direction = factor.get(
                "direction",
                "decreases_risk",
            )

        result.append(
            {
                "feature":
                    str(feature),

                "contribution":
                    round(
                        contribution,
                        4,
                    ),

                "direction":
                    direction,
            }
        )

    return result


def fallback_interventions(
    risk_level: str,
    student_data: dict,
):
    if risk_level == "HIGH":
        return [
            "Academic mentoring",
            "Tuition-support review",
            "Review scholarship or financial-aid eligibility",
        ]

    if risk_level == "MEDIUM":
        return [
            "Academic progress check-in",
            "Faculty mentoring",
        ]

    return [
        "Routine academic monitoring"
    ]


@app.get("/")
def root():
    return {
        "message":
            "EduPredict AI backend is running",

        "status":
            "online",

        "docs":
            "/docs",
    }


@app.get("/health")
def health():
    return {
        "status":
            "healthy"
    }


@app.post("/predict")
def predict(
    student_data: dict = Body(...)
):
    try:
        normalized_data = (
            normalize_student_data(
                student_data
            )
        )

        probability = predict_dropout(
            normalized_data
        )

        probability = (
            normalize_probability(
                probability
            )
        )

        risk_level = get_risk_level(
            probability
        )

        risk_factors = []

        try:
            risk_factors = (
                explain_student(
                    model,
                    normalized_data,
                )
            )

        except Exception as error:
            print(
                "SHAP ERROR:",
                repr(error),
            )

            risk_factors = []

        risk_factors = (
            normalize_risk_factors(
                risk_factors
            )
        )

        interventions = []

        try:
            interventions = (
                generate_intervention_plan(
                    normalized_data,
                    risk_level,
                )
            )

        except TypeError:
            try:
                interventions = (
                    generate_intervention_plan(
                        normalized_data
                    )
                )

            except Exception as error:
                print(
                    "INTERVENTION ERROR:",
                    repr(error),
                )

        except Exception as error:
            print(
                "INTERVENTION ERROR:",
                repr(error),
            )

        if not interventions:
            interventions = (
                fallback_interventions(
                    risk_level,
                    normalized_data,
                )
            )

        return {
            "dropout_probability":
                round(
                    probability,
                    4,
                ),

            "dropout_probability_percent":
                round(
                    probability * 100,
                    2,
                ),

            "risk_level":
                risk_level,

            "risk_factors":
                risk_factors,

            "interventions":
                interventions,

            "monitoring":
                get_monitoring_frequency(
                    risk_level
                ),
        }

    except Exception as error:
        print(
            "PREDICTION ERROR:",
            repr(error),
        )

        return {
            "error":
                "Prediction failed.",

            "detail":
                str(error),
        }


@app.post("/assessments")
def save_assessment(
    data: dict = Body(...),
):
    try:
        assessment_id = data.get(
            "id",
            f"ASSESS-{int(datetime.now().timestamp() * 1000)}",
        )

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


@app.get("/assessments")
def get_assessments():
    rows = get_all_assessments()

    results = []

    for row in rows:
        item = dict(row)

        try:
            item["risk_factors"] = json.loads(
                item.get(
                    "risk_factors",
                    "[]",
                )
            )
        except Exception:
            item["risk_factors"] = []

        try:
            item["interventions"] = json.loads(
                item.get(
                    "interventions",
                    "[]",
                )
            )
        except Exception:
            item["interventions"] = []

        try:
            item["student_data"] = json.loads(
                item.get(
                    "student_data",
                    "{}",
                )
            )
        except Exception:
            item["student_data"] = {}

        results.append(item)

    return results


@app.get(
    "/students/{student_id}/assessments"
)
def get_student_history(
    student_id: str,
):
    rows = get_student_assessments(
        student_id
    )

    results = []

    for row in rows:
        item = dict(row)

        try:
            item["risk_factors"] = json.loads(
                item.get(
                    "risk_factors",
                    "[]",
                )
            )
        except Exception:
            item["risk_factors"] = []

        try:
            item["interventions"] = json.loads(
                item.get(
                    "interventions",
                    "[]",
                )
            )
        except Exception:
            item["interventions"] = []

        try:
            item["student_data"] = json.loads(
                item.get(
                    "student_data",
                    "{}",
                )
            )
        except Exception:
            item["student_data"] = {}

        results.append(item)

    return results


@app.get(
    "/students/{student_id}/interventions"
)
def get_interventions(
    student_id: str,
):
    return get_student_interventions(
        student_id
    )


@app.post(
    "/students/{student_id}/interventions"
)
def save_interventions(
    student_id: str,
    data: list = Body(...),
):
    try:
        save_student_interventions(
            student_id,
            data,
        )

        return {
            "message":
                "Interventions saved successfully",

            "student_id":
                student_id,
        }

    except Exception as error:
        return {
            "error":
                "Could not save interventions.",

            "detail":
                str(error),
        }