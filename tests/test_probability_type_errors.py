"""Invalid numeric input should not produce a misleading valid risk score."""
import unittest
from backend.probability import normalize_probability


class InvalidProbabilityInputTest(unittest.TestCase):
    def test_unsupported_values_raise(self):
        for value in (None, object(), [], {}, "not-a-number"):
            with self.subTest(value=repr(value)), self.assertRaises((TypeError, ValueError)):
                normalize_probability(value)

    def test_zero_and_numeric_strings_are_accepted(self):
        self.assertEqual(normalize_probability(0), 0.0)
        self.assertEqual(normalize_probability("75"), 0.75)


if __name__ == "__main__":
    unittest.main()
