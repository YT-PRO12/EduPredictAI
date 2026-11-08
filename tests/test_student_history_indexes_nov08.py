"""Index migration is repeatable on a disposable SQLite database."""
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from backend import database


class StudentHistoryIndexTests(unittest.TestCase):
    def test_schema_initialization_creates_indexes_once(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "synthetic.db"
            with patch.object(database, "DATABASE_PATH", path):
                database.initialize_database()
                database.initialize_interventions_table()
                # Existing installations can safely run initialization again.
                database.initialize_database()
                database.initialize_interventions_table()

                with sqlite3.connect(path) as connection:
                    assessments = {
                        row[1] for row in connection.execute("PRAGMA index_list(assessments)")
                    }
                    interventions = {
                        row[1] for row in connection.execute("PRAGMA index_list(interventions)")
                    }
                self.assertIn("idx_assessments_student_created", assessments)
                self.assertIn("idx_interventions_student_week", interventions)


if __name__ == "__main__":
    unittest.main()
