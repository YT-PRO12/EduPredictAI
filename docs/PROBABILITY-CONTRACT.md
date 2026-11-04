# Prediction probability contract

[backend/probability.py](../backend/probability.py) normalizes a finite input into 0–1. The existing API convention interprets numbers **greater than 1** as percentages: 75 → 0.75. Exactly 1 means fractional 100%, not 1%.

| Input | Output |
| --- | --- |
| 0.4 | 0.4 |
| 1 | 1 |
| 40 | 0.4 |
| 100 | 1 |
| -5 | 0 |
| NaN / Infinity | rejected |

Finite results are clamped to 0–1. New model integrations must explicitly define their output scale instead of assuming this historical convention fits. A normalized score is not necessarily a calibrated probability or a validated student-risk estimate.
