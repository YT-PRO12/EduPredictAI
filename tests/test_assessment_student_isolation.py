import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from backend import database
from backend.assessments import create_assessment

class StudentHistoryIsolationTest(unittest.TestCase):
    def test_assessments_remain_scoped_to_student(self):
        with tempfile.TemporaryDirectory() as d:
            with patch.object(database, "DATABASE_PATH", Path(d) / "test.db"):
                database.initialize_database()
                first = create_assessment({"student_id": "synthetic-a", "probability": 20})
                second = create_assessment({"student_id": "synthetic-b", "probability": 80})
                self.assertIn("id", first)
                self.assertIn("id", second)
                self.assertEqual(
                    [r["id"] for r in database.get_student_assessments("synthetic-a")],
                    [first["id"]],
                )
                self.assertEqual(
                    [r["id"] for r in database.get_student_assessments("synthetic-b")],
                    [second["id"]],
                )

if __name__ == "__main__":
    unittest.main()
