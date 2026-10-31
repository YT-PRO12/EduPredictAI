import unittest
from backend.probability import normalize_probability

class ProbabilityClampTest(unittest.TestCase):
    def test_finite_extremes_are_bounded(self):
        self.assertEqual(normalize_probability(1e100), 1.0)
        self.assertEqual(normalize_probability(-1e100), 0.0)
        self.assertEqual(normalize_probability(0), 0.0)

if __name__ == "__main__":
    unittest.main()
