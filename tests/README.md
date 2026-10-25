# Database regression tests

Run from the repository root with Python 3.10 or newer:

```bash
python -m unittest discover -s tests -v
```

These tests use only the standard library and temporary SQLite files with
synthetic student identifiers. They do not import the prediction API, load
pickled models, require frontend configuration, or access deployed services.

Intervention replacement must commit the complete new list or retain the old
list on failure, preserve other students' records, and close the connection on
both paths so a failed request cannot retain a write lock.
