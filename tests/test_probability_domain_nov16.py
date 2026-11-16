"""Probability is a fraction from zero through one, not an arbitrary score."""
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from backend import database
from backend.assessments import create_assessment


class AssessmentProbabilityDomainTests(unittest.TestCase):
    def test_endpoints_are_valid_but_outside_values_do_not_persist(self):
        with tempfile.TemporaryDirectory() as directory:
            with patch.object(database, "DATABASE_PATH", Path(directory) / "test.db"):
                database.initialize_database()

                for valid in (0, 1):
                    result = create_assessment({
                        "student_id": "synthetic-student",
                        "probability": valid,
                    })
                    self.assertIn("id", result)

                for invalid in (-0.0001, 1.0001, 200, "-1", "1.5"):
                    with self.subTest(value=invalid):
                        result = create_assessment({
                            "student_id": "synthetic-student",
                            "probability": invalid,
                        })
                        self.assertEqual(result["error"], "Could not save assessment.")

                rows = database.get_all_assessments()
                self.assertEqual(len(rows), 2)
                self.assertEqual(sorted(item["probability"] for item in rows), [0, 1])


if __name__ == "__main__":
    unittest.main()
