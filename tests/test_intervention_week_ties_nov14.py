"""Stable intervention order is scoped to each synthetic student."""
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from backend import database


class InterventionWeekOrderTests(unittest.TestCase):
    def test_tied_weeks_use_row_id_as_a_stable_tiebreaker(self):
        with tempfile.TemporaryDirectory() as folder:
            with patch.object(database, "DATABASE_PATH", Path(folder) / "test.db"):
                database.initialize_interventions_table()
                database.save_student_interventions("student-a", [
                    {"id": 30, "week": 2, "title": "Later"},
                    {"id": 20, "week": 1, "title": "First"},
                    {"id": 10, "week": 1, "title": "Second"},
                ])
                database.save_student_interventions("student-b", [
                    {"id": 30, "week": 1, "title": "Different student"},
                ])
                rows = database.get_student_interventions("student-a")
                self.assertEqual([r["title"] for r in rows], ["First", "Second", "Later"])
                self.assertEqual(len(database.get_student_interventions("student-b")), 1)


if __name__ == "__main__":
    unittest.main()
