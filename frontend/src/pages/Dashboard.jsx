import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";

const API_URL = "http://127.0.0.1:8000";

function Dashboard() {
  const [assessments, setAssessments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  async function loadAssessments() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/assessments`
      );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error(
          "Invalid assessment data received."
        );
      }

      setAssessments(data);
    } catch (err) {
      console.error(
        "Dashboard error:",
        err
      );

      setError(
        "Could not load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssessments();
  }, []);

  const students = useMemo(() => {
    const latestByStudent = {};

    for (const assessment of assessments) {
      const id =
        assessment.student_id ||
        assessment.id;

      if (!id) {
        continue;
      }

      const existing =
        latestByStudent[id];

      if (
        !existing ||
        new Date(
          assessment.created_at || 0
        ) >
          new Date(
            existing.created_at || 0
          )
      ) {
        latestByStudent[id] =
          assessment;
      }
    }

    return Object.values(
      latestByStudent
    );
  }, [assessments]);

  const highRisk = students.filter(
    (student) =>
      student.risk === "HIGH"
  ).length;

  const mediumRisk = students.filter(
    (student) =>
      student.risk === "MEDIUM"
  ).length;

  const lowRisk = students.filter(
    (student) =>
      student.risk === "LOW"
  ).length;

  const averageRisk =
    students.length === 0
      ? 0
      : (
          students.reduce(
            (sum, student) =>
              sum +
              Number(
                student.probability || 0
              ),
            0
          ) /
          students.length
        ).toFixed(1);

  const recentAssessments =
    [...assessments]
      .sort(
        (a, b) =>
          new Date(
            b.created_at || 0
          ) -
          new Date(
            a.created_at || 0
          )
      )
      .slice(0, 5);

  if (loading) {
    return (
      <div className="placeholder-page">
        <div className="empty-students-icon">
          ...
        </div>

        <h1>
          Loading dashboard
        </h1>

        <p>
          Fetching live assessment data.
        </p>
      </div>
    );
  }

  return (
    <div>

      <div className="page-heading">

        <div>

          <span className="eyebrow">
            EDU PREDICT AI
          </span>

          <h1>
            Student risk overview
          </h1>

          <p>
            Monitor student risk and take action
            before problems become critical.
          </p>

        </div>

        <button
          type="button"
          className="ghost-button"
          onClick={loadAssessments}
        >
          ↻ Refresh
        </button>

      </div>


      {error && (
        <div className="error">
          {error}
        </div>
      )}


      <div className="metrics">

        <div className="metric-card">

          <span>
            Assessed students
          </span>

          <strong>
            {students.length}
          </strong>

          <small>
            Total students with assessments
          </small>

        </div>


        <div className="metric-card metric-high">

          <span>
            High risk
          </span>

          <strong>
            {highRisk}
          </strong>

          <small>
            Students needing attention
          </small>

        </div>


        <div className="metric-card metric-medium">

          <span>
            Monitoring
          </span>

          <strong>
            {mediumRisk}
          </strong>

          <small>
            Students requiring monitoring
          </small>

        </div>


        <div className="metric-card metric-low">

          <span>
            Stable
          </span>

          <strong>
            {lowRisk}
          </strong>

          <small>
            Lower predicted risk
          </small>

        </div>

      </div>


      <div className="dashboard-grid">


        <div className="white-card">

          <div className="card-title">

            <div>

              <span className="eyebrow">
                RISK DISTRIBUTION
              </span>

              <h2>
                Current student risk
              </h2>

            </div>

          </div>


          <div className="risk-overview">

            <div className="risk-donut">

              <div className="donut-inner">

                <strong>
                  {averageRisk}%
                </strong>

                <span>
                  Average predicted risk
                </span>

              </div>

            </div>


            <div className="risk-legend">

              <div>

                <span className="legend-dot high" />

                <span>
                  High risk
                </span>

                <strong>
                  {highRisk}
                </strong>

              </div>


              <div>

                <span className="legend-dot medium" />

                <span>
                  Monitoring
                </span>

                <strong>
                  {mediumRisk}
                </strong>

              </div>


              <div>

                <span className="legend-dot low" />

                <span>
                  Stable
                </span>

                <strong>
                  {lowRisk}
                </strong>

              </div>

            </div>

          </div>

        </div>


        <div className="quick-assessment">

          <div className="quick-content">

            <span className="eyebrow">
              QUICK ACTION
            </span>

            <h2>
              Assess a student
            </h2>

            <p>
              Generate a dropout-risk prediction,
              explain the result, and create a
              support plan.
            </p>

            <Link
              to="/assessment"
              className="primary-button"
            >
              Start assessment →
            </Link>

          </div>

          <div className="quick-orb">
            AI
          </div>

        </div>


        <div className="white-card">

          <div className="card-title">

            <div>

              <span className="eyebrow">
                RECENT ACTIVITY
              </span>

              <h2>
                Latest assessments
              </h2>

            </div>

            <Link
              to="/students"
              className="view-all"
            >
              View all →
            </Link>

          </div>


          {recentAssessments.length === 0 ? (

            <div className="empty-students">

              <h2>
                No assessments yet
              </h2>

              <p>
                Start your first student assessment.
              </p>

              <Link
                to="/assessment"
                className="primary-button"
              >
                Assess student →
              </Link>

            </div>

          ) : (

            <div className="assessment-list">

              {recentAssessments.map(
                (assessment) => (

                  <div
                    className="assessment-row"
                    key={
                      assessment.id
                    }
                  >

                    <div className="student-avatar">
                      {
                        assessment.student_name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                        "S"
                      }
                    </div>


                    <div className="assessment-name">

                      <strong>
                        {assessment.student_name ||
                          "Student"}
                      </strong>

                      <span>
                        {assessment.student_id ||
                          assessment.id}
                      </span>

                    </div>


                    <span
                      className={
                        `risk-tag ${
                          assessment.risk?.toLowerCase() ||
                          "low"
                        }`
                      }
                    >
                      {assessment.risk}
                    </span>


                    <span className="assessment-score">
                      {assessment.probability}%
                    </span>

                  </div>

                )
              )}

            </div>

          )}

        </div>


        <div className="white-card">

          <div className="card-title">

            <div>

              <span className="eyebrow">
                AI WORKFLOW
              </span>

              <h2>
                Predict → Explain → Intervene
              </h2>

            </div>

          </div>


          <div className="dashboard-workflow">

            <div>

              <span>
                01
              </span>

              <div>

                <strong>
                  Predict
                </strong>

                <p>
                  Estimate student dropout probability.
                </p>

              </div>

            </div>


            <div>

              <span>
                02
              </span>

              <div>

                <strong>
                  Explain
                </strong>

                <p>
                  Identify the strongest model contributors.
                </p>

              </div>

            </div>


            <div>

              <span>
                03
              </span>

              <div>

                <strong>
                  Intervene
                </strong>

                <p>
                  Apply targeted support actions.
                </p>

              </div>

            </div>


            <div>

              <span>
                04
              </span>

              <div>

                <strong>
                  Monitor
                </strong>

                <p>
                  Track risk changes over time.
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;