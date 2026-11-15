"""Student identifiers are SQL parameters, never SQL syntax."""
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from backend import database


class StudentLookupParameterizationTests(unittest.TestCase):
    def test_intervention_lookup_cannot_inject_another_student(self):
        with tempfile.TemporaryDirectory() as directory:
            with patch.object(database, "DATABASE_PATH", Path(directory) / "synthetic.db"):
                database.initialize_interventions_table()
                database.save_student_interventions("student-a", [
                    {"id": 1, "week": 1, "title": "Synthetic mentoring A"},
                ])
                database.save_student_interventions("student-b", [
                    {"id": 1, "week": 2, "title": "Synthetic mentoring B"},
                ])

                hostile = "student-a' OR 1=1 --"
                self.assertEqual(database.get_student_interventions(hostile), [])
                self.assertEqual(
                    [row["title"] for row in database.get_student_interventions("student-a")],
                    ["Synthetic mentoring A"],
                )
                self.assertEqual(len(database.get_student_interventions("student-b")), 1)


if __name__ == "__main__":
    unittest.main()
