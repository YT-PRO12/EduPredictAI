import math
import unittest

from backend.probability import normalize_probability


class ProbabilityNormalizationTest(unittest.TestCase):
    def test_fraction_percent_and_clamps(self):
        for value, expected in [(0.3, 0.3), (45, 0.45), (100, 1.0),
                                (200, 1.0), (-4, 0.0), (1, 1.0)]:
            self.assertEqual(normalize_probability(value), expected)

    def test_nonfinite_values_fail_closed(self):
        for value in (math.nan, math.inf, -math.inf, "nan", "inf"):
            with self.subTest(value=value), self.assertRaises(ValueError):
                normalize_probability(value)


if __name__ == "__main__":
    unittest.main()
