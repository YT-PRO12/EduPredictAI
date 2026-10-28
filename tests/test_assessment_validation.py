import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from backend import database
from backend.assessments import create_assessment

class AssessmentValidationTest(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        target = patch.object(database, "DATABASE_PATH", Path(directory.name) / "test.db")
        target.start()
        self.addCleanup(target.stop)
        database.initialize_database()

    def test_invalid_probabilities_never_create_rows(self):
        for value in [-1, 101, float("nan"), float("inf"), -float("inf"), "NaN", "Infinity", True, None, []]:
            with self.subTest(value=value):
                result = create_assessment({"probability": value})
                self.assertIn("error", result)
                self.assertEqual(database.get_all_assessments(), [])

    def test_probability_boundaries_and_decimal_values_are_preserved(self):
        for value in [0, 100, 32.5, "42.25"]:
            self.assertIn("id", create_assessment({"probability": value}))
        self.assertEqual(sorted(row["probability"] for row in database.get_all_assessments()), [0, 32.5, 42.25, 100])
