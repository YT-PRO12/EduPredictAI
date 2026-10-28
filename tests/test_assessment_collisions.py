import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from backend import database
from backend.assessments import create_assessment

class AssessmentCollisionTest(unittest.TestCase):
    def test_identifier_collision_cannot_replace_a_stored_assessment(self):
        with tempfile.TemporaryDirectory() as directory:
            with patch.object(database, "DATABASE_PATH", Path(directory) / "test.db"):
                database.initialize_database()
                with patch("backend.assessments.new_assessment_id", return_value="ASSESS-synthetic-collision"):
                    first = create_assessment({"student_id": "first", "probability": 20})
                    self.assertIn("id", first)
                    original = database.get_all_assessments()
                    second = create_assessment({"student_id": "second", "probability": 80})
                    self.assertIn("error", second)
                    self.assertEqual(database.get_all_assessments(), original)
                self.assertIn("id", create_assessment({"student_id": "third"}))
                self.assertEqual(len(database.get_all_assessments()), 2)
