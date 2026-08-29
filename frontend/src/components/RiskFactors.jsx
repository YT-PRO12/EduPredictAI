function RiskFactors({ factors }) {
  if (!factors || factors.length === 0) {
    return (
      <div className="panel">
        <h3>Risk Factors</h3>
        <p>No risk factors available.</p>
      </div>
    );
  }

  return (
    <div className="panel">

      <div className="panel-header">
        <div>
          <p className="section-label">
            EXPLAINABLE AI
          </p>

          <h3>
            Why is this student at risk?
          </h3>
        </div>
      </div>

      <div className="factor-list">

        {factors.map((factor, index) => {

          const isPositive =
            factor.direction === "increases_risk";

          return (
            <div
              className="factor-row"
              key={index}
            >

              <div className="factor-info">

                <span className="factor-name">
                  {factor.feature}
                </span>

                <span
                  className={
                    isPositive
                      ? "factor-positive"
                      : "factor-negative"
                  }
                >
                  {isPositive
                    ? "Increases risk"
                    : "Reduces risk"}
                </span>

              </div>

              <div
                className={
                  isPositive
                    ? "factor-arrow positive"
                    : "factor-arrow negative"
                }
              >
                {isPositive ? "↑" : "↓"}
              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default RiskFactors;