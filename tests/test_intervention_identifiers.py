import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from backend import database

class InterventionIdentifiersTest(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        target = patch.object(database, "DATABASE_PATH", Path(directory.name) / "test.db")
        target.start()
        self.addCleanup(target.stop)
        database.initialize_interventions_table()
        database.save_student_interventions("synthetic", [{"id": 1, "title": "Preserve me"}])

    def test_ambiguous_or_duplicate_ids_preserve_existing_plan(self):
        before = database.get_student_interventions("synthetic")
        for items in [[{"id": 1}, {"id": "01"}], [{"id": 1.5}], [{"id": True}], [{"id": 0}], [{"id": -1}], [{"id": 2**63}], [{"id": "1e2"}], [None]]:
            with self.subTest(items=items):
                with self.assertRaises(ValueError):
                    database.save_student_interventions("synthetic", items)
                self.assertEqual(database.get_student_interventions("synthetic"), before)

    def test_integer_strings_and_distinct_ids_are_stored_exactly(self):
        database.save_student_interventions("synthetic", [{"id": "2"}, {"id": 3}])
        self.assertEqual({row["id"] for row in database.get_student_interventions("synthetic")}, {2, 3})
