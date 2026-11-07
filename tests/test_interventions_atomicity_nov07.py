"""A failed replacement must roll back the DELETE and earlier INSERTs."""
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from backend import database


class InterventionReplacementAtomicityTest(unittest.TestCase):
    def test_invalid_replacement_does_not_erase_original(self):
        with tempfile.TemporaryDirectory() as directory:
            with patch.object(database, "DATABASE_PATH", Path(directory) / "test.db"):
                database.initialize_interventions_table()
                database.save_student_interventions("synthetic", [
                    {"id": 1, "title": "Existing mentoring", "week": 1},
                ])
                with self.assertRaises((TypeError, ValueError)):
                    database.save_student_interventions("synthetic", [
                        {"id": 2, "title": "Temporary", "week": 2},
                        {"id": "not-an-int", "title": "Invalid", "week": 3},
                    ])
                saved = database.get_student_interventions("synthetic")
                self.assertEqual(len(saved), 1)
                self.assertEqual(saved[0]["title"], "Existing mentoring")
                self.assertEqual(saved[0]["id"], 1)


if __name__ == "__main__":
    unittest.main()
