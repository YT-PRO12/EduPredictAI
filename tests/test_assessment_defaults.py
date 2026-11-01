import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from backend import database
from backend.assessments import create_assessment

class AssessmentDefaultsTest(unittest.TestCase):
    def test_defaults_persist_for_new_assessment(self):
        with tempfile.TemporaryDirectory() as d:
            with patch.object(database, "DATABASE_PATH", Path(d) / "test.db"):
                database.initialize_database()
                result = create_assessment({"student_id": "synthetic", "risk": "MEDIUM"})
                self.assertIn("id", result)
                rows = database.get_student_assessments("synthetic")
                self.assertEqual(len(rows), 1)
                self.assertEqual(rows[0]["student_name"], "Student")
                self.assertEqual(rows[0]["status"], "Monitoring")
                self.assertEqual(rows[0]["monitoring"], "Every 2 weeks")

if __name__ == "__main__":
    unittest.main()
