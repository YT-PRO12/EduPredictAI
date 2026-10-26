import unittest
from uuid import UUID
from backend.identifiers import new_assessment_id

class AssessmentIdentifiersTest(unittest.TestCase):
    def test_rapid_assessments_do_not_share_a_millisecond_identifier(self):
        ids = [new_assessment_id() for _ in range(10000)]
        self.assertEqual(len(ids), len(set(ids)))
        for value in ids:
            self.assertRegex(value, r"^ASSESS-[0-9a-f]{32}$")
            self.assertEqual(UUID(value.removeprefix("ASSESS-")).version, 4)

if __name__ == "__main__":
    unittest.main()
