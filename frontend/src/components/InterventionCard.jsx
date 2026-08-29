function InterventionCard({
  interventions,
  monitoring
}) {
  return (
    <div className="panel">

      <div className="panel-header">
        <div>
          <p className="section-label">
            ACTION PLAN
          </p>

          <h3>
            Recommended Interventions
          </h3>
        </div>
      </div>

      <div className="intervention-list">

        {interventions?.map(
          (intervention, index) => (

            <div
              className="intervention-item"
              key={index}
            >

              <div className="check-icon">
                ✓
              </div>

              <span>
                {intervention}
              </span>

            </div>

          )
        )}

      </div>

      <div className="monitoring-box">

        <span>
          Monitoring frequency
        </span>

        <strong>
          {monitoring}
        </strong>

      </div>

    </div>
  );
}

export default InterventionCard;