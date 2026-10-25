"""Synthetic SQLite regressions; no model artifact or production database is loaded."""
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from backend import database


class InterventionTransactionsTest(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        path = Path(self.directory.name) / "test.db"
        self.connection_patch = patch.object(database, "DATABASE_PATH", path)
        self.connection_patch.start()
        self.addCleanup(self.connection_patch.stop)
        database.initialize_interventions_table()
        database.save_student_interventions("synthetic-a", [{"id": 1, "title": "Original"}])
        database.save_student_interventions("synthetic-b", [{"id": 2, "title": "Other student"}])

    def test_replacement_commits_and_preserves_other_students(self):
        database.save_student_interventions("synthetic-a", [{"id": 3, "title": "Replacement"}])
        rows = database.get_student_interventions("synthetic-a")
        self.assertEqual([(row["id"], row["title"]) for row in rows], [(3, "Replacement")])
        self.assertEqual(database.get_student_interventions("synthetic-b")[0]["id"], 2)

    def test_empty_replacement_clears_only_requested_student(self):
        database.save_student_interventions("synthetic-a", [])
        self.assertEqual(database.get_student_interventions("synthetic-a"), [])
        self.assertEqual(len(database.get_student_interventions("synthetic-b")), 1)

    def test_partial_insert_failure_rolls_back_and_closes_connection(self):
        before = database.get_student_interventions("synthetic-a")
        connection = database.get_connection()
        with patch.object(database, "get_connection", return_value=connection):
            with self.assertRaises(sqlite3.IntegrityError):
                database.save_student_interventions("synthetic-a", [
                    {"id": 3, "title": "Must roll back"},
                    {"id": 4, "status": None},
                ])
        self.assertEqual(database.get_student_interventions("synthetic-a"), before)
        with self.assertRaises(sqlite3.ProgrammingError):
            connection.execute("SELECT 1")
        database.save_student_interventions("synthetic-a", [{"id": 5}])
        self.assertEqual(database.get_student_interventions("synthetic-a")[0]["id"], 5)

    def test_invalid_identifier_rolls_back_and_closes_connection(self):
        before = database.get_student_interventions("synthetic-a")
        connection = database.get_connection()
        with patch.object(database, "get_connection", return_value=connection):
            with self.assertRaises(ValueError):
                database.save_student_interventions("synthetic-a", [{"id": "invalid"}])
        self.assertEqual(database.get_student_interventions("synthetic-a"), before)
        with self.assertRaises(sqlite3.ProgrammingError):
            connection.execute("SELECT 1")

    def test_successful_replacement_closes_connection(self):
        connection = database.get_connection()
        with patch.object(database, "get_connection", return_value=connection):
            database.save_student_interventions("synthetic-a", [{"id": 6}])
        with self.assertRaises(sqlite3.ProgrammingError):
            connection.execute("SELECT 1")


if __name__ == "__main__":
    unittest.main()
