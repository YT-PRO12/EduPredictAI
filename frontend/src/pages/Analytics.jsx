function Analytics() {
  const modelMetrics = {
    accuracy: 0.763554,
    precision: 0.612903,
    dropoutRecall: 0.713615,
    dropoutF1: 0.659436,
    rocAuc: 0.845945,
  };

  const models = [
    {
      name: "Tuned Logistic Regression",
      accuracy: 0.763554,
      dropoutRecall: 0.713615,
      dropoutF1: 0.659436,
      rocAuc: 0.845945,
    },
    {
      name: "Tuned XGBoost",
      accuracy: 0.789831,
      dropoutRecall: 0.535211,
      dropoutF1: 0.620408,
      rocAuc: 0.835058,
    },
    {
      name: "Random Forest",
      accuracy: 0.787651,
      dropoutRecall: 0.464789,
      dropoutF1: 0.584071,
      rocAuc: 0.830580,
    },
  ];

  const outcomes = [
    {
      name: "Dropout",
      count: 1421,
      percentage: 32.1,
      className: "dropout-bar",
    },
    {
      name: "Enrolled",
      count: 794,
      percentage: 17.9,
      className: "enrolled-bar",
    },
    {
      name: "Graduate",
      count: 2209,
      percentage: 49.9,
      className: "graduate-bar",
    },
  ];

  const percentage = (value) =>
    `${(value * 100).toFixed(1)}%`;

  return (
    <div className="analytics-page">

      <div className="page-heading">

        <div>

          <span className="eyebrow">
            ANALYTICS CENTER
          </span>

          <h1>
            Model & risk intelligence
          </h1>

          <p>
            Monitor model performance, student outcomes,
            and early-warning intelligence.
          </p>

        </div>

      </div>


      <div className="analytics-metrics">

        <div className="analytics-metric-card">

          <span>
            Accuracy
          </span>

          <strong>
            {percentage(
              modelMetrics.accuracy
            )}
          </strong>

          <small>
            Tuned Logistic Regression
          </small>

        </div>


        <div className="analytics-metric-card">

          <span>
            Dropout Recall
          </span>

          <strong>
            {percentage(
              modelMetrics.dropoutRecall
            )}
          </strong>

          <small>
            Early-warning sensitivity
          </small>

        </div>


        <div className="analytics-metric-card">

          <span>
            Dropout F1
          </span>

          <strong>
            {percentage(
              modelMetrics.dropoutF1
            )}
          </strong>

          <small>
            Precision-recall balance
          </small>

        </div>


        <div className="analytics-metric-card highlight-metric">

          <span>
            ROC-AUC
          </span>

          <strong>
            {percentage(
              modelMetrics.rocAuc
            )}
          </strong>

          <small>
            Ranking performance
          </small>

        </div>

      </div>


      <div className="analytics-grid">


        <div className="analytics-card">

          <div className="analytics-card-header">

            <div>

              <span className="eyebrow">
                OUTCOME DISTRIBUTION
              </span>

              <h2>
                Historical student outcomes
              </h2>

            </div>

            <span className="analytics-badge">
              4,424 records
            </span>

          </div>


          <div className="outcome-chart">

            {outcomes.map(
              (outcome) => (

                <div
                  className="outcome-row"
                  key={outcome.name}
                >

                  <div className="outcome-label">

                    <span>
                      {outcome.name}
                    </span>

                    <strong>
                      {outcome.count.toLocaleString()}
                    </strong>

                  </div>


                  <div className="outcome-track">

                    <div
                      className={`outcome-fill ${outcome.className}`}
                      style={{
                        width:
                          `${outcome.percentage * 2}%`,
                      }}
                    />

                  </div>


                  <span className="outcome-percent">
                    {outcome.percentage}%
                  </span>

                </div>

              )
            )}

          </div>

        </div>


        <div className="analytics-card">

          <div className="analytics-card-header">

            <div>

              <span className="eyebrow">
                CURRENT PIPELINE
              </span>

              <h2>
                AI workflow
              </h2>

            </div>

          </div>


          <div className="analytics-pipeline">

            <div className="pipeline-item">

              <span>
                01
              </span>

              <div>

                <strong>
                  Predict
                </strong>

                <small>
                  Dropout probability
                </small>

              </div>

            </div>


            <div className="pipeline-arrow">
              ↓
            </div>


            <div className="pipeline-item">

              <span>
                02
              </span>

              <div>

                <strong>
                  Explain
                </strong>

                <small>
                  SHAP risk factors
                </small>

              </div>

            </div>


            <div className="pipeline-arrow">
              ↓
            </div>


            <div className="pipeline-item">

              <span>
                03
              </span>

              <div>

                <strong>
                  Intervene
                </strong>

                <small>
                  Support plan
                </small>

              </div>

            </div>


            <div className="pipeline-arrow">
              ↓
            </div>


            <div className="pipeline-item">

              <span>
                04
              </span>

              <div>

                <strong>
                  Reassess
                </strong>

                <small>
                  Track risk change
                </small>

              </div>

            </div>

          </div>

        </div>


        <div className="analytics-card analytics-model-card">

          <div className="analytics-card-header">

            <div>

              <span className="eyebrow">
                MODEL COMPARISON
              </span>

              <h2>
                Trained model performance
              </h2>

            </div>

          </div>


          <div className="model-table">

            <div className="model-table-row model-table-header">

              <span>
                Model
              </span>

              <span>
                Accuracy
              </span>

              <span>
                Dropout Recall
              </span>

              <span>
                F1
              </span>

              <span>
                ROC-AUC
              </span>

            </div>


            {models.map(
              (model) => (

                <div
                  className="model-table-row"
                  key={model.name}
                >

                  <strong>
                    {model.name}
                  </strong>

                  <span>
                    {percentage(
                      model.accuracy
                    )}
                  </span>

                  <span>
                    {percentage(
                      model.dropoutRecall
                    )}
                  </span>

                  <span>
                    {percentage(
                      model.dropoutF1
                    )}
                  </span>

                  <span className="model-auc">
                    {percentage(
                      model.rocAuc
                    )}
                  </span>

                </div>

              )
            )}

          </div>

        </div>


        <div className="analytics-card analytics-insight">

          <span className="eyebrow">
            MODEL INSIGHT
          </span>

          <h2>
            Why ROC-AUC matters here
          </h2>

          <p>
            EduPredict AI is an early-warning system, so
            model performance should not be judged only by
            overall accuracy. Dropout recall and ROC-AUC are
            especially useful for evaluating how well the
            system identifies students who may be at risk.
          </p>


          <div className="insight-row">

            <div>
              <span>
                Best accuracy
              </span>

              <strong>
                Tuned XGBoost
              </strong>
            </div>


            <div>
              <span>
                Best dropout recall
              </span>

              <strong>
                Tuned Logistic Regression
              </strong>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Analytics;