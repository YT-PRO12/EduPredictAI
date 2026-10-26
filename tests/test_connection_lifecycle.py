"""Database failures release connections; tests use disposable in-memory SQLite."""
import sqlite3
import unittest
from unittest.mock import patch
from backend import database

class ConnectionLifecycleTest(unittest.TestCase):
    def assert_closed(self, connection):
        with self.assertRaises(sqlite3.ProgrammingError):
            connection.execute("SELECT 1")

    def test_reads_close_on_missing_table(self):
        for function, args in [(database.get_all_assessments, ()),
                               (database.get_student_assessments, ("synthetic",)),
                               (database.get_student_interventions, ("synthetic",))]:
            with self.subTest(function=function.__name__):
                connection = sqlite3.connect(":memory:")
                with patch.object(database, "get_connection", return_value=connection):
                    with self.assertRaises(sqlite3.OperationalError):
                        function(*args)
                self.assert_closed(connection)

    def test_initialization_closes_when_schema_creation_is_denied(self):
        for function in [database.initialize_database, database.initialize_interventions_table]:
            with self.subTest(function=function.__name__):
                connection = sqlite3.connect(":memory:")
                connection.set_authorizer(lambda *args: sqlite3.SQLITE_DENY)
                with patch.object(database, "get_connection", return_value=connection):
                    with self.assertRaises(sqlite3.DatabaseError):
                        function()
                self.assert_closed(connection)

    def test_assessment_write_closes_on_invalid_input(self):
        connection = sqlite3.connect(":memory:")
        with patch.object(database, "get_connection", return_value=connection):
            with self.assertRaises(KeyError):
                database.insert_assessment({})
        self.assert_closed(connection)

if __name__ == "__main__":
    unittest.main()
