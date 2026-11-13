"""Student history order must be deterministic when created_at values tie."""
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from backend import database


def row(identifier, student="synthetic-student"):
    return {
        "id": identifier,
        "student_id": student,
        "student_name": "Synthetic Student",
        "risk": "LOW",
        "probability": 0.2,
        "created_at": "2026-11-13T10:00:00",
    }


class AssessmentTimestampTieTests(unittest.TestCase):
    def test_tied_timestamps_sort_by_id_without_crossing_students(self):
        with tempfile.TemporaryDirectory() as folder:
            with patch.object(database, "DATABASE_PATH", Path(folder) / "test.db"):
                database.initialize_database()
                database.insert_assessment(row("z-last"))
                database.insert_assessment(row("a-first"))
                database.insert_assessment(row("m-other", "another-student"))

                student = database.get_student_assessments("synthetic-student")
                self.assertEqual([item["id"] for item in student], ["a-first", "z-last"])

                all_ids = [item["id"] for item in database.get_all_assessments()]
                self.assertEqual(all_ids, ["z-last", "m-other", "a-first"])


if __name__ == "__main__":
    unittest.main()
