"""Assessment persistence must reject non-finite scores without exposing internals."""
import math
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from backend import database
from backend.assessments import create_assessment


class NonFiniteAssessmentTests(unittest.TestCase):
    def test_nonfinite_probabilities_do_not_create_rows(self):
        with tempfile.TemporaryDirectory() as directory:
            with patch.object(database, "DATABASE_PATH", Path(directory) / "test.db"):
                database.initialize_database()
                for invalid in (math.nan, math.inf, -math.inf, "NaN", "Infinity"):
                    with self.subTest(value=str(invalid)):
                        result = create_assessment({
                            "student_id": "synthetic-test",
                            "probability": invalid,
                        })
                        self.assertEqual(result["error"], "Could not save assessment.")
                        self.assertNotIn("Traceback", str(result))
                self.assertEqual(database.get_all_assessments(), [])


if __name__ == "__main__":
    unittest.main()
