"""Assessment persistence failures must not disclose database internals."""
import unittest
from unittest.mock import patch
from backend.assessments import create_assessment


class AssessmentErrorDisclosureTest(unittest.TestCase):
    def test_database_failure_is_sanitized(self):
        with patch("backend.assessments.insert_assessment",
                   side_effect=RuntimeError("SECRET_CONNECTION_STRING")):
            result = create_assessment({"student_id": "synthetic-test"})
        self.assertEqual(result["error"], "Could not save assessment.")
        self.assertNotIn("SECRET_CONNECTION_STRING", str(result))
        self.assertNotIn("Traceback", str(result))


if __name__ == "__main__":
    unittest.main()
