import sqlite3
import re
from contextlib import closing
from pathlib import Path
from datetime import datetime


BASE_DIR = Path(__file__).resolve().parent.parent

DATABASE_DIR = BASE_DIR / "database"
DATABASE_DIR.mkdir(exist_ok=True)

DATABASE_PATH = DATABASE_DIR / "edupredict.db"


def get_connection():
    connection = sqlite3.connect(
        DATABASE_PATH
    )

    connection.row_factory = sqlite3.Row

    return connection


def initialize_database():
    with closing(get_connection()) as connection, connection:
        cursor = connection.cursor()

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS assessments (
                id TEXT PRIMARY KEY,
                student_id TEXT NOT NULL,
                student_name TEXT NOT NULL,
                course TEXT,
                year TEXT,
                probability REAL NOT NULL,
                risk TEXT NOT NULL,
                status TEXT,
                monitoring TEXT,
                risk_factors TEXT,
                interventions TEXT,
                student_data TEXT,
                created_at TEXT NOT NULL
            )
            """
        )



def insert_assessment(data):
    with closing(get_connection()) as connection, connection:
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO assessments (
                id,
                student_id,
                student_name,
                course,
                year,
                probability,
                risk,
                status,
                monitoring,
                risk_factors,
                interventions,
                student_data,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                data["id"],
                data["student_id"],
                data["student_name"],
                data.get("course"),
                data.get("year"),
                data["probability"],
                data["risk"],
                data.get("status"),
                data.get("monitoring"),
                data.get("risk_factors", "[]"),
                data.get("interventions", "[]"),
                data.get("student_data", "{}"),
                data["created_at"],
            ),
        )



def get_all_assessments():
    with closing(get_connection()) as connection:
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT *
            FROM assessments
            ORDER BY created_at DESC
            """
        )

        rows = cursor.fetchall()


        return [dict(row) for row in rows]


def get_student_assessments(student_id):
    with closing(get_connection()) as connection:
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT *
            FROM assessments
            WHERE student_id = ?
            ORDER BY created_at ASC
            """,
            (student_id,),
        )

        rows = cursor.fetchall()


        return [dict(row) for row in rows]


def initialize_interventions_table():
    with closing(get_connection()) as connection, connection:
        cursor = connection.cursor()

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS interventions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_id TEXT NOT NULL,
                intervention_id INTEGER NOT NULL,
                week INTEGER,
                title TEXT,
                description TEXT,
                status TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )



def intervention_identifier(value):
    if isinstance(value, bool):
        raise ValueError("Intervention ID must be a positive integer")
    if isinstance(value, str) and re.fullmatch(r"[0-9]+", value):
        value = int(value)
    if not isinstance(value, int) or not 1 <= value <= 9007199254740991:
        raise ValueError("Intervention ID must fit a positive JavaScript-safe integer")
    return value


def save_student_interventions(
    student_id,
    interventions,
):
    # The connection context commits or rolls back; closing also releases locks.
    with closing(get_connection()) as connection, connection:
        cursor = connection.cursor()

        if not isinstance(interventions, list):
            raise ValueError("Interventions must be a list")
        identifiers = []
        for item in interventions:
            if not isinstance(item, dict):
                raise ValueError("Each intervention must be an object")
            identifiers.append(intervention_identifier(item.get("id")))
        if len(identifiers) != len(set(identifiers)):
            raise ValueError("Intervention IDs must be unique within a student's plan")

        cursor.execute(
            """
            DELETE FROM interventions
            WHERE student_id = ?
            """,
            (student_id,),
        )

        for item, identifier in zip(interventions, identifiers):
            cursor.execute(
                """
                INSERT INTO interventions (
                    student_id,
                    intervention_id,
                    week,
                    title,
                    description,
                    status,
                    updated_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    student_id,
                    identifier,
                    item.get("week"),
                    item.get("title"),
                    item.get("description"),
                    item.get(
                        "status",
                        "pending",
                    ),
                    datetime.now().isoformat(),
                ),
            )


def get_student_interventions(
    student_id,
):
    with closing(get_connection()) as connection:
        cursor = connection.cursor()

        cursor.execute(
            """
            SELECT
                intervention_id AS id,
                week,
                title,
                description,
                status,
                updated_at
            FROM interventions
            WHERE student_id = ?
            ORDER BY week ASC
            """,
            (student_id,),
        )

        rows = cursor.fetchall()


        return [dict(row) for row in rows]
