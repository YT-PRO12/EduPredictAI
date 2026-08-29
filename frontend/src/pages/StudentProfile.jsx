import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { API_URL } from "../config";


function cleanFactor(feature) {
  if (!feature) {
    return "Unknown factor";
  }

  return feature
    .replace(/^num__/, "")
    .replace(/^cat__/, "")
    .replace(/_[0-9]+$/, "");
}


function StudentProfile() {
  const { studentId } =
    useParams();

  const navigate =
    useNavigate();

  const [history, setHistory] =
    useState([]);

  const [interventions, setInterventions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [loadingInterventions, setLoadingInterventions] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  async function loadHistory() {
    try {
      const response =
        await fetch(
          `${API_URL}/students/${studentId}/assessments`
        );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data =
        await response.json();

      setHistory(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {
      console.error(err);

      setError(
        "Could not load student history."
      );
    }
  }


  async function loadInterventions() {
    try {
      setLoadingInterventions(
        true
      );

      const response =
        await fetch(
          `${API_URL}/students/${studentId}/interventions`
        );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data =
        await response.json();

      setInterventions(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {
      console.error(err);

      setInterventions([]);

    } finally {
      setLoadingInterventions(
        false
      );
    }
  }


  useEffect(() => {

    async function load() {
      try {
        setLoading(true);

        await Promise.all([
          loadHistory(),
          loadInterventions(),
        ]);

      } finally {
        setLoading(false);
      }
    }

    load();

  }, [studentId]);


  async function createPlan() {

    const plan = [
      {
        id: 1,
        week: 1,
        title:
          "Academic mentor assignment",
        description:
          "Assign a mentor and conduct an initial academic review.",
        status: "pending",
      },
      {
        id: 2,
        week: 2,
        title:
          "Academic progress check-in",
        description:
          "Review attendance, coursework, and current academic progress.",
        status: "pending",
      },
      {
        id: 3,
        week: 3,
        title:
          "Financial support review",
        description:
          "Review tuition obligations and available financial support.",
        status: "pending",
      },
      {
        id: 4,
        week: 4,
        title:
          "Risk reassessment",
        description:
          "Run a new AI assessment using the latest student information.",
        status: "pending",
      },
    ];

    try {
      setSaving(true);

      const response =
        await fetch(
          `${API_URL}/students/${studentId}/interventions`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(plan),
          }
        );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      await loadInterventions();

    } catch (err) {
      setError(
        "Could not create support plan."
      );
    } finally {
      setSaving(false);
    }
  }


  async function toggleIntervention(
    interventionId
  ) {
    const updated =
      interventions.map(
        (item) =>
          Number(item.id) ===
          Number(interventionId)
            ? {
                ...item,
                status:
                  item.status ===
                  "completed"
                    ? "pending"
                    : "completed",
              }
            : item
      );

    setInterventions(updated);

    try {
      setSaving(true);

      const response =
        await fetch(
          `${API_URL}/students/${studentId}/interventions`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(updated),
          }
        );

      if (!response.ok) {
        throw new Error(
          "Could not save."
        );
      }

    } catch (err) {

      setError(
        "Could not save intervention progress."
      );

      await loadInterventions();

    } finally {
      setSaving(false);
    }
  }


  if (loading) {
    return (
      <div className="placeholder-page">

        <div className="empty-students-icon">
          ...
        </div>

        <h1>
          Loading student
        </h1>

        <p>
          Fetching data from the database.
        </p>

      </div>
    );
  }


  if (
    history.length === 0
  ) {
    return (
      <div className="placeholder-page">

        <div className="empty-students-icon">
          !
        </div>

        <h1>
          Student not found
        </h1>

        <p>
          No assessment history exists for this student.
        </p>

        <Link
          to="/students"
          className="primary-button"
        >
          ← Back to students
        </Link>

      </div>
    );
  }


  const orderedHistory =
    [...history].sort(
      (a, b) =>
        new Date(
          a.created_at || 0
        ) -
        new Date(
          b.created_at || 0
        )
    );


  const first =
    orderedHistory[0];


  const latest =
    orderedHistory[
      orderedHistory.length - 1
    ];


  const initialRisk =
    Number(
      first.probability || 0
    );


  const currentRisk =
    Number(
      latest.probability || 0
    );


  const change =
    Number(
      (
        initialRisk -
        currentRisk
      ).toFixed(2)
    );


  const completed =
    interventions.filter(
      (item) =>
        item.status ===
        "completed"
    ).length;


  const total =
    interventions.length;


  const progress =
    total === 0
      ? 0
      : Math.round(
          (completed / total) *
            100
        );


  return (
    <div className="student-profile-page">

      <div className="student-profile-header">

        <div>

          <span className="eyebrow">
            STUDENT PROFILE
          </span>

          <h1>
            {latest.student_name}
          </h1>

          <p>
            {latest.student_id}
            {" · "}
            {latest.course || "—"}
          </p>

        </div>


        <div className="profile-header-actions">

          <Link
            to="/students"
            className="ghost-button"
          >
            ← Back
          </Link>


          <button
            type="button"
            className="primary-button profile-button"
            onClick={() =>
              navigate(
                "/assessment",
                {
                  state: {
                    student: {
                      id:
                        latest.student_id,
                      name:
                        latest.student_name,
                      course:
                        latest.course,
                      year:
                        latest.year,
                    },
                  },
                }
              )
            }
          >
            Reassess →
          </button>

        </div>

      </div>


      <div className="profile-grid">

        <div className="profile-risk-card">

          <div className="profile-card-top">

            <div>

              <span className="eyebrow">
                CURRENT RISK
              </span>

              <h2>
                Dropout probability
              </h2>

            </div>


            <span
              className={
                `risk-tag ${
                  latest.risk?.toLowerCase()
                }`
              }
            >
              {latest.risk}
            </span>

          </div>


          <div className="profile-risk-score">
            {currentRisk}%
          </div>


          <p className="profile-description">
            Latest model-based student risk prediction.
          </p>

        </div>


        <div className="profile-info-card">

          <span className="eyebrow">
            PROFILE OVERVIEW
          </span>

          <h2>
            Student information
          </h2>

          <div className="profile-info-list">

            <div>
              <span>
                Student ID
              </span>

              <strong>
                {latest.student_id}
              </strong>
            </div>


            <div>
              <span>
                Program
              </span>

              <strong>
                {latest.course ||
                  "—"}
              </strong>
            </div>


            <div>
              <span>
                Academic year
              </span>

              <strong>
                {latest.year ||
                  "—"}
              </strong>
            </div>


            <div>
              <span>
                Assessments
              </span>

              <strong>
                {history.length}
              </strong>
            </div>

          </div>

        </div>

      </div>


      <div className="profile-workflow">

        <div className="profile-workflow-step">
          <span>
            01
          </span>

          <strong>
            Risk Assessment
          </strong>

          <p>
            {currentRisk}% current risk
          </p>
        </div>


        <div className="profile-workflow-step">
          <span>
            02
          </span>

          <strong>
            Explainability
          </strong>

          <p>
            {latest.risk_factors?.length || 0}
            {" "}
            model factors
          </p>
        </div>


        <div className="profile-workflow-step">
          <span>
            03
          </span>

          <strong>
            Intervention
          </strong>

          <p>
            {completed} of {total} complete
          </p>
        </div>


        <div className="profile-workflow-step">
          <span>
            04
          </span>

          <strong>
            Monitoring
          </strong>

          <p>
            {latest.monitoring ||
              "Monthly"}
          </p>
        </div>

      </div>


      <div className="white-card profile-section">

        <div className="card-title">

          <div>

            <span className="eyebrow">
              RISK JOURNEY
            </span>

            <h2>
              Risk over time
            </h2>

            <p>
              Compare predicted risk across assessments.
            </p>

          </div>

        </div>


        <div className="risk-history-summary">

          <div>

            <span>
              INITIAL RISK
            </span>

            <strong>
              {initialRisk}%
            </strong>

          </div>


          <div className="risk-history-arrow">
            →
          </div>


          <div>

            <span>
              CURRENT RISK
            </span>

            <strong>
              {currentRisk}%
            </strong>

          </div>


          <div
            className={
              change > 0
                ? "risk-improvement positive"
                : change < 0
                  ? "risk-improvement negative"
                  : "risk-improvement neutral"
            }
          >

            <span>
              CHANGE
            </span>

            <strong>
              {change > 0
                ? `-${change}`
                : change}
              %
            </strong>

            <small>
              {change > 0
                ? "Risk improved"
                : change < 0
                  ? "Risk increased"
                  : "No change"}
            </small>

          </div>

        </div>


        <div className="risk-chart">

          {orderedHistory.map(
            (assessment, index) => {

              const probability =
                Number(
                  assessment.probability ||
                    0
                );

              return (
                <div
                  className="risk-chart-row"
                  key={
                    assessment.id ||
                    index
                  }
                >

                  <div className="risk-chart-date">
                    {assessment.created_at
                      ? new Date(
                          assessment.created_at
                        ).toLocaleDateString()
                      : `Assessment ${
                          index + 1
                        }`}
                  </div>


                  <div className="risk-chart-track">

                    <div
                      className={
                        `risk-chart-fill ${
                          assessment.risk?.toLowerCase()
                        }`
                      }
                      style={{
                        width:
                          `${Math.min(
                            probability,
                            100
                          )}%`,
                      }}
                    />

                  </div>


                  <strong>
                    {probability}%
                  </strong>


                  <span
                    className={
                      `risk-tag ${
                        assessment.risk?.toLowerCase()
                      }`
                    }
                  >
                    {assessment.risk}
                  </span>

                </div>
              );
            }
          )}

        </div>

      </div>


      <div className="white-card profile-section">

        <div className="card-title">

          <div>

            <span className="eyebrow">
              EXPLAINABLE AI
            </span>

            <h2>
              Why was this risk predicted?
            </h2>

          </div>

          <div className="xai-badge">
            SHAP
          </div>

        </div>


        <div className="result-factors">

          {latest.risk_factors?.length > 0 ? (

            latest.risk_factors
              .slice(0, 8)
              .map(
                (factor, index) => {

                  const positive =
                    factor.direction ===
                    "increases_risk";

                  return (
                    <div
                      className="result-factor"
                      key={index}
                    >

                      <div className="factor-number">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </div>


                      <div>

                        <strong>
                          {cleanFactor(
                            factor.feature
                          )}
                        </strong>

                        <span
                          className={
                            positive
                              ? "red-text"
                              : "green-text"
                          }
                        >
                          {positive
                            ? "Increases predicted risk"
                            : "Reduces predicted risk"}
                        </span>

                      </div>


                      <div
                        className={
                          positive
                            ? "factor-arrow red-arrow"
                            : "factor-arrow green-arrow"
                        }
                      >
                        {positive
                          ? "↑"
                          : "↓"}
                      </div>

                    </div>
                  );
                }
              )

          ) : (

            <div className="profile-empty">
              No explanation is available for this assessment.
            </div>

          )}

        </div>

      </div>


      <div className="white-card profile-section">

        <div className="card-title">

          <div>

            <span className="eyebrow">
              SUPPORT
            </span>

            <h2>
              Recommended support
            </h2>

          </div>

        </div>


        <div className="intervention-results">

          {latest.interventions?.map(
            (item, index) => (

              <div
                className="intervention-result"
                key={index}
              >

                <div>
                  ✓
                </div>

                <div>

                  <strong>
                    {item}
                  </strong>

                  <span>
                    Recommended support action
                  </span>

                </div>

              </div>

            )
          )}

        </div>

      </div>


      <div className="white-card profile-section">

        <div className="card-title">

          <div>

            <span className="eyebrow">
              30-DAY SUPPORT PLAN
            </span>

            <h2>
              Intervention progress
            </h2>

          </div>

          <div className="progress-percentage">
            {progress}%
          </div>

        </div>


        <div className="progress-bar">

          <div
            style={{
              width:
                `${progress}%`,
            }}
          />

        </div>


        <div className="progress-summary">

          <span>
            {completed} of {total}
            {" "}
            actions completed
          </span>

          <strong>
            {progress === 100
              ? "Plan completed"
              : "Plan in progress"}
          </strong>

        </div>


        {loadingInterventions ? (

          <div className="profile-empty">
            Loading intervention plan...
          </div>

        ) : interventions.length === 0 ? (

          <div className="profile-empty">

            <p>
              No intervention plan has been created yet.
            </p>

            <button
              type="button"
              className="primary-button"
              disabled={saving}
              onClick={createPlan}
            >
              {saving
                ? "Creating..."
                : "Create support plan"}
            </button>

          </div>

        ) : (

          <div className="intervention-timeline">

            {interventions.map(
              (item) => {

                const done =
                  item.status ===
                  "completed";

                return (
                  <div
                    className={
                      done
                        ? "timeline-item completed"
                        : "timeline-item"
                    }
                    key={item.id}
                  >

                    <div className="timeline-marker">
                      {done
                        ? "✓"
                        : item.week}
                    </div>


                    <div className="timeline-content">

                      <div className="timeline-top">

                        <span>
                          WEEK{" "}
                          {item.week}
                        </span>

                        <button
                          type="button"
                          disabled={saving}
                          onClick={() =>
                            toggleIntervention(
                              item.id
                            )
                          }
                        >
                          {done
                            ? "Mark pending"
                            : "Mark complete"}
                        </button>

                      </div>


                      <strong>
                        {item.title}
                      </strong>


                      <p>
                        {item.description}
                      </p>


                      <div className="plan-status">

                        {done
                          ? "✓ Completed"
                          : "○ Pending"}

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </div>


      {error && (
        <div className="error">
          {error}
        </div>
      )}

    </div>
  );
}

export default StudentProfile;