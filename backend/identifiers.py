"""Opaque assessment identifiers independent of clock resolution."""
from uuid import uuid4


def new_assessment_id():
    return f"ASSESS-{uuid4().hex}"
