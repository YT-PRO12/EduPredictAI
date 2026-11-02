import unittest
from unittest.mock import patch

from backend.assessments import create_assessment


class AssessmentErrorContractTest(unittest.TestCase):
    def test_persistence_error_is_sanitized(self):
        with patch("backend.assessments.insert_assessment",
                   side_effect=RuntimeError("secret connection details")):
            result = create_assessment({
                "student_id": "synthetic-test", "probability": 0.5,
            })
        self.assertEqual(result["error"], "Could not save assessment.")
        self.assertNotIn("secret connection details", str(result))


if __name__ == "__main__":
    unittest.main()
