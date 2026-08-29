import sqlite3
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
    connection = get_connection()

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

    connection.commit()
    connection.close()


def insert_assessment(data):
    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        """
        INSERT OR REPLACE INTO assessments (
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

    connection.commit()
    connection.close()


def get_all_assessments():
    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM assessments
        ORDER BY created_at DESC
        """
    )

    rows = cursor.fetchall()

    connection.close()

    return [dict(row) for row in rows]


def get_student_assessments(student_id):
    connection = get_connection()

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

    connection.close()

    return [dict(row) for row in rows]


def initialize_interventions_table():
    connection = get_connection()

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

    connection.commit()
    connection.close()


def save_student_interventions(
    student_id,
    interventions,
):
    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(
        """
        DELETE FROM interventions
        WHERE student_id = ?
        """,
        (student_id,),
    )

    for item in interventions:
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
                int(item["id"]),
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

    connection.commit()
    connection.close()


def get_student_interventions(
    student_id,
):
    connection = get_connection()

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

    connection.close()

    return [dict(row) for row in rows]