"""A duplicated identifier must never silently overwrite another assessment."""
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from backend import database


class DuplicateAssessmentStorageTest(unittest.TestCase):
    def test_duplicate_id_preserves_original_row(self):
        with tempfile.TemporaryDirectory() as directory:
            with patch.object(database, "DATABASE_PATH", Path(directory) / "test.db"):
                database.initialize_database()
                payload = {"id": "ASSESS-test", "student_id": "synthetic-a",
                           "student_name": "Synthetic A", "probability": 0.2,
                           "risk": "LOW", "created_at": "2026-01-01T00:00:00"}
                database.insert_assessment(payload)
                with self.assertRaises(sqlite3.IntegrityError):
                    database.insert_assessment({**payload, "probability": 0.9})
                rows = database.get_student_assessments("synthetic-a")
                self.assertEqual(len(rows), 1)
                self.assertEqual(rows[0]["probability"], 0.2)


if __name__ == "__main__":
    unittest.main()
