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

    def test_invalid_student_identity_does_not_pollute_history(self):
        for field, limit in [("student_id", 128), ("student_name", 200)]:
            for value in ["", " ", None, 7, {}, "x" * (limit + 1)]:
                with self.subTest(field=field, value=value):
                    self.assertIn("error", create_assessment({field: value}))
                    self.assertEqual(database.get_all_assessments(), [])

    def test_unicode_identity_is_preserved_without_silent_normalization(self):
        result = create_assessment({"student_id": "legacy student १", "student_name": "परीक्षण 学生"})
        self.assertIn("id", result)
        row = database.get_all_assessments()[0]
        self.assertEqual(row["student_id"], "legacy student १")
        self.assertEqual(row["student_name"], "परीक्षण 学生")
