"""Independent synthetic students may reuse an intervention ID safely."""
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from backend import database


class InterventionIdentityIsolationTest(unittest.TestCase):
    def test_equal_intervention_ids_do_not_cross_student_boundaries(self):
        with tempfile.TemporaryDirectory() as directory:
            with patch.object(database, "DATABASE_PATH", Path(directory) / "test.db"):
                database.initialize_interventions_table()
                database.save_student_interventions("synthetic-a", [
                    {"id": 1, "title": "Mentoring A", "week": 1},
                ])
                database.save_student_interventions("synthetic-b", [
                    {"id": 1, "title": "Mentoring B", "week": 1},
                ])
                database.save_student_interventions("synthetic-a", [
                    {"id": 2, "title": "Updated A", "week": 2},
                ])
                student_a = database.get_student_interventions("synthetic-a")
                student_b = database.get_student_interventions("synthetic-b")
                self.assertEqual([item["title"] for item in student_a], ["Updated A"])
                self.assertEqual([item["title"] for item in student_b], ["Mentoring B"])


if __name__ == "__main__":
    unittest.main()
