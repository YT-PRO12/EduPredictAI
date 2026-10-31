# Assessment creation and retries

The assessment creation endpoint generates an opaque server-owned identifier for every request. Client-provided IDs do not select the stored row.

## Request retry boundary

A repeated POST is a **new creation**, not an idempotent replay. Clients should retain the returned ID and avoid automatic retries after ambiguous network failures without confirming whether a record was created.

The database rejects duplicate primary keys rather than silently replacing existing assessment records. Handle collisions as errors and investigate rather than overwriting data.

Tests use isolated SQLite files and synthetic students. The API currently does not offer a request idempotency key; adding one requires a separately designed persistence contract.

See the root README for the documented assessment creation contract.
