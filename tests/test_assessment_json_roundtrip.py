"""Use synthetic students and a disposable database; no ML model is loaded."""
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from backend import database
from backend.assessments import create_assessment


class AssessmentJsonContractTest(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        database_patch = patch.object(database, "DATABASE_PATH", Path(directory.name) / "test.db")
        database_patch.start()
        self.addCleanup(database_patch.stop)
        database.initialize_database()

    def test_factors_and_interventions_round_trip_without_mutation(self):
        factors = [{"feature": "synthetic-score", "contribution": 0.2}]
        interventions = ["Academic mentoring"]
        student = {"synthetic_field": 1}
        result = create_assessment({
            "student_id": "synthetic-a",
            "risk_factors": factors,
            "interventions": interventions,
            "student_data": student,
        })
        self.assertIn("id", result)
        row = database.get_student_assessments("synthetic-a")[0]
        self.assertEqual(json.loads(row["risk_factors"]), factors)
        self.assertEqual(json.loads(row["interventions"]), interventions)
        self.assertEqual(json.loads(row["student_data"]), student)

    def test_unserializable_input_is_rejected_without_writing(self):
        result = create_assessment({
            "student_id": "synthetic-b", "risk_factors": {1, 2},
        })
        self.assertEqual(result["error"], "Could not save assessment.")
        self.assertEqual(database.get_all_assessments(), [])


if __name__ == "__main__":
    unittest.main()
