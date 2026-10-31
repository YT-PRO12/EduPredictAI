import unittest
from backend.probability import normalize_probability

class ProbabilityPrecisionTest(unittest.TestCase):
    def test_fractional_values(self):
        self.assertAlmostEqual(normalize_probability(0.399), 0.399)
        self.assertAlmostEqual(normalize_probability(0.6), 0.6)
        self.assertAlmostEqual(normalize_probability(59.5), 0.595)

if __name__ == "__main__":
    unittest.main()
