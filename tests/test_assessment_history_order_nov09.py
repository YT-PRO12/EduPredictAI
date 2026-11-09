"""History queries must preserve student boundaries and ascending timestamps."""
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from backend import database


def assessment(identifier, student, created_at):
    return {
        "id": identifier,
        "student_id": student,
        "student_name": "Synthetic Student",
        "probability": 0.25,
        "risk": "LOW",
        "created_at": created_at,
    }


class AssessmentHistoryOrderTest(unittest.TestCase):
    def test_student_history_is_sorted_and_other_students_excluded(self):
        with tempfile.TemporaryDirectory() as folder:
            with patch.object(database, "DATABASE_PATH", Path(folder) / "test.db"):
                database.initialize_database()
                database.insert_assessment(assessment("later", "student-a", "2026-11-09T12:00:00"))
                database.insert_assessment(assessment("other", "student-b", "2026-11-09T11:00:00"))
                database.insert_assessment(assessment("earlier", "student-a", "2026-11-09T10:00:00"))
                history = database.get_student_assessments("student-a")
                self.assertEqual([item["id"] for item in history], ["earlier", "later"])
                self.assertEqual(database.get_student_assessments("missing"), [])


if __name__ == "__main__":
    unittest.main()
