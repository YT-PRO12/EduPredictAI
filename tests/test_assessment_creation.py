"""Exercise the POST service against disposable SQLite, without loading ML models."""
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from backend import database
from backend.assessments import create_assessment


class AssessmentCreationTest(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        connection_patch = patch.object(database, "DATABASE_PATH", Path(directory.name) / "test.db")
        connection_patch.start()
        self.addCleanup(connection_patch.stop)
        database.initialize_database()

    def test_duplicate_client_identifiers_preserve_both_assessments(self):
        payload = {"id": "ASSESS-123", "student_id": "synthetic-a", "probability": 25}
        first = create_assessment(payload)
        second = create_assessment({**payload, "probability": 75})
        self.assertNotEqual(first["id"], second["id"])
        self.assertNotEqual(first["id"], payload["id"])
        rows = database.get_student_assessments("synthetic-a")
        self.assertEqual({row["id"] for row in rows}, {first["id"], second["id"]})
        self.assertEqual({row["probability"] for row in rows}, {25, 75})
        self.assertEqual(payload["id"], "ASSESS-123")

    def test_missing_client_identifier_returns_persisted_server_identifier(self):
        result = create_assessment({"student_name": "Synthetic student"})
        rows = database.get_all_assessments()
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["id"], result["id"])
        self.assertEqual(rows[0]["student_id"], result["student_id"])


if __name__ == "__main__":
    unittest.main()
