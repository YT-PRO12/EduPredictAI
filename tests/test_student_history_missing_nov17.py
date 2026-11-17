"""Missing student queries should not leak other students' assessments."""
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from backend import database


class MissingStudentHistoryTests(unittest.TestCase):
    def test_absent_student_returns_empty_without_mutating_saved_rows(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "synthetic.db"
            with patch.object(database, "DATABASE_PATH", path):
                database.initialize_database()
                payload = {
                    "id": "SYNTH-1", "student_id": "student-a",
                    "student_name": "Synthetic Student", "probability": 25.0,
                    "risk": "LOW", "created_at": "2026-11-17T09:00:00",
                }
                database.insert_assessment(payload)
                self.assertEqual(database.get_student_assessments("not-present"), [])
                self.assertEqual(
                    [r["id"] for r in database.get_student_assessments("student-a")],
                    ["SYNTH-1"],
                )
                self.assertEqual(len(database.get_all_assessments()), 1)


if __name__ == "__main__":
    unittest.main()
