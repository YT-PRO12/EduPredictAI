"""Preserve fractional and percent-style legacy inputs, but reject out-of-range scores."""
import math
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from backend import database
from backend.assessments import create_assessment


class AssessmentProbabilityDomainTests(unittest.TestCase):
    def test_legacy_percentage_values_are_preserved_and_invalid_values_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            with patch.object(database, "DATABASE_PATH", Path(directory) / "test.db"):
                database.initialize_database()

                for valid in (0, 0.25, 1, 25, 75, 100):
                    result = create_assessment({
                        "student_id": "synthetic-student",
                        "probability": valid,
                    })
                    self.assertIn("id", result)

                for invalid in (-0.0001, 100.0001, 200, "-1", "1e309", math.nan):
                    with self.subTest(value=str(invalid)):
                        result = create_assessment({
                            "student_id": "synthetic-student",
                            "probability": invalid,
                        })
                        self.assertEqual(result["error"], "Could not save assessment.")

                rows = database.get_all_assessments()
                self.assertEqual(len(rows), 6)
                self.assertEqual(
                    sorted(item["probability"] for item in rows),
                    [0, 0.25, 1, 25, 75, 100],
                )


if __name__ == "__main__":
    unittest.main()
