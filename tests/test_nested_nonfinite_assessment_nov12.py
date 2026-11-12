"""Reject non-standard JSON numbers in all serialized assessment metadata."""
import math
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from backend import database
from backend.assessments import create_assessment


class NestedNonfiniteAssessmentTests(unittest.TestCase):
    def test_nonfinite_json_metadata_rolls_back_without_leaking(self):
        for key, invalid in (
            ("risk_factors", [{"importance": math.nan}]),
            ("interventions", [{"value": math.inf}]),
            ("student_data", {"scale": -math.inf}),
        ):
            with self.subTest(field=key), tempfile.TemporaryDirectory() as folder:
                with patch.object(database, "DATABASE_PATH", Path(folder) / "test.db"):
                    database.initialize_database()
                    result = create_assessment({
                        "student_id": "synthetic",
                        "probability": 0.3,
                        key: invalid,
                    })
                    self.assertEqual(result["error"], "Could not save assessment.")
                    self.assertEqual(database.get_all_assessments(), [])
                    self.assertNotIn("Traceback", str(result))


if __name__ == "__main__":
    unittest.main()
