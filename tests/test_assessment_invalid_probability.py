import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from backend import database
from backend.assessments import create_assessment

class AssessmentInvalidProbabilityTest(unittest.TestCase):
    def test_invalid_probability_does_not_persist(self):
        with tempfile.TemporaryDirectory() as d:
            with patch.object(database, "DATABASE_PATH", Path(d) / "test.db"):
                database.initialize_database()
                response = create_assessment({
                    "student_id": "synthetic", "probability": "not-a-number",
                })
                self.assertIn("error", response)
                self.assertEqual(database.get_all_assessments(), [])
                self.assertNotIn("not-a-number", str(response))

if __name__ == "__main__":
    unittest.main()
