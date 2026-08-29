function RiskCard({ result }) {
  if (!result) {
    return null;
  }

  return (
    <div className="risk-card">

      <div className="risk-card-header">
        <div>
          <p className="section-label">
            DROPOUT RISK
          </p>

          <h2>
            Student Risk Assessment
          </h2>
        </div>

        <div className="risk-badge">
          {result.risk_level}
        </div>
      </div>

      <div className="risk-percentage">
        {result.dropout_probability_percent}%
      </div>

      <p className="risk-description">
        Predicted probability of dropout based on
        the student's current profile.
      </p>

    </div>
  );
}

export default RiskCard;