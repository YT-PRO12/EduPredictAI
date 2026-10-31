import unittest
from backend.assessments import get_status, get_monitoring_frequency

class AssessmentStatusTest(unittest.TestCase):
    def test_risk_mapping(self):
        self.assertEqual(get_status("HIGH"), "Needs attention")
        self.assertEqual(get_status("MEDIUM"), "Monitoring")
        self.assertEqual(get_status("LOW"), "Stable")

    def test_review_cadence(self):
        self.assertEqual(get_monitoring_frequency("HIGH"), "Weekly")
        self.assertEqual(get_monitoring_frequency("MEDIUM"), "Every 2 weeks")
        self.assertEqual(get_monitoring_frequency("LOW"), "Monthly")

if __name__ == "__main__":
    unittest.main()
