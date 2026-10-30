"""Normalize model probability outputs without propagating NaN or infinity."""
import math


def normalize_probability(value):
    """Accept fractional (0..1) or percent-style scores; clamp to [0, 1].

    This preserves the API's existing >1-as-percent convention. A value of
    exactly 1 means a fractional probability of 100%, not 1%.
    """
    probability = float(value)
    if not math.isfinite(probability):
        raise ValueError("Probability must be finite")
    if probability > 1:
        probability /= 100
    return max(0.0, min(probability, 1.0))
