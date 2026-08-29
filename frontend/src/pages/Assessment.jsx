import { useState } from "react";
import { useLocation } from "react-router-dom";

import { API_URL } from "../config";

import {
  genderOptions,
  attendanceOptions,
  yesNoOptions,
  courseOptions,
} from "../data/options";


const initialStudent = {
  marital_status: 1,
  application_mode: 17,
  application_order: 5,
  course: 9119,
  daytime_evening_attendance: 1,
  previous_qualification: 1,
  previous_qualification_grade: 122,
  nacionality: 1,
  mothers_qualification: 19,
  fathers_qualification: 12,
  mothers_occupation: 5,
  fathers_occupation: 9,
  admission_grade: 127.3,
  displaced: 1,
  educational_special_needs: 0,
  debtor: 0,
  tuition_fees_up_to_date: 1,
  gender: 1,
  scholarship_holder: 0,
  age_at_enrollment: 20,
  international: 0,
  unemployment_rate: 10.8,
  inflation_rate: 1.4,
  gdp: 1.74,
};


function cleanFactor(feature) {
  if (!feature) {
    return "Unknown factor";
  }

  return feature
    .replace(/^num__/, "")
    .replace(/^cat__/, "")
    .replace(/_[0-9]+$/, "");
}


function riskDescription(level) {
  if (level === "HIGH") {
    return "This student may benefit from closer monitoring and targeted support.";
  }

  if (level === "MEDIUM") {
    return "This student may benefit from additional monitoring and timely support.";
  }

  return "The current model indicates a comparatively lower predicted dropout risk.";
}


function Assessment() {
  const location = useLocation();

  const reassessmentStudent =
    location.state?.student || null;

  const [student, setStudent] =
    useState({
      ...initialStudent,
    });

  const [studentId, setStudentId] =
    useState(
      reassessmentStudent?.id || ""
    );

  const [studentName, setStudentName] =
    useState(
      reassessmentStudent?.name || ""
    );

  const [studentCourse, setStudentCourse] =
    useState(
      reassessmentStudent?.course || ""
    );

  const [studentYear, setStudentYear] =
    useState(
      reassessmentStudent?.year || ""
    );

  const [result, setResult] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  function handleChange(event) {
    const {
      name,
      value,
    } = event.target;

    const numericValue =
      Number(value);

    setStudent((current) => ({
      ...current,
      [name]: numericValue,
    }));
  }


  function resetForm() {
    setStudent({
      ...initialStudent,
    });

    setStudentId("");
    setStudentName("");
    setStudentCourse("");
    setStudentYear("");

    setResult(null);
    setError("");
  }


  async function assessRisk() {
    try {
      setLoading(true);
      setError("");
      setResult(null);

      const predictionResponse =
        await fetch(
          `${API_URL}/predict`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(student),
          }
        );

      const predictionData =
        await predictionResponse.json();

      if (
        !predictionResponse.ok ||
        predictionData.error
      ) {
        throw new Error(
          predictionData.detail ||
            "Prediction failed."
        );
      }

      const finalStudentId =
        studentId.trim() ||
        `STU-${Date.now()}`;

      const finalStudentName =
        studentName.trim() ||
        `Student ${finalStudentId.slice(-4)}`;

      const assessmentData = {
        id:
          `ASSESS-${Date.now()}`,

        student_id:
          finalStudentId,

        student_name:
          finalStudentName,

        course:
          studentCourse ||
          "B.Tech",

        year:
          studentYear ||
          "Current",

        probability:
          Number(
            predictionData.dropout_probability_percent
          ),

        risk:
          predictionData.risk_level,

        status:
          predictionData.risk_level ===
          "HIGH"
            ? "Needs attention"
            : predictionData.risk_level ===
                "MEDIUM"
              ? "Monitoring"
              : "Stable",

        monitoring:
          predictionData.monitoring,

        risk_factors:
          predictionData.risk_factors ||
          [],

        interventions:
          predictionData.interventions ||
          [],

        student_data:
          student,

        created_at:
          new Date().toISOString(),
      };


      const saveResponse =
        await fetch(
          `${API_URL}/assessments`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                assessmentData
              ),
          }
        );

      const saveData =
        await saveResponse.json();

      if (
        !saveResponse.ok ||
        saveData.error
      ) {
        throw new Error(
          saveData.detail ||
            "Assessment could not be saved."
        );
      }

      setResult(
        predictionData
      );
    } catch (err) {
      console.error(
        "Assessment error:",
        err
      );

      setError(
        err.message ||
          "Unable to complete assessment."
      );
    } finally {
      setLoading(false);
    }
  }


  if (result) {
    return (
      <div className="assessment-result">

        <div className="result-heading">

          <div>

            <span className="eyebrow">
              ASSESSMENT COMPLETE
            </span>

            <h1>
              Student risk profile
            </h1>

            <p>
              AI-powered prediction,
              explanation, and recommended support.
            </p>

          </div>

          <button
            type="button"
            className="ghost-button"
            onClick={resetForm}
          >
            ← New assessment
          </button>

        </div>


        <div className="result-main-grid">

          <div className="result-score-card">

            <span className="eyebrow">
              DROPOUT RISK
            </span>

            <div className="result-score">
              {
                result.dropout_probability_percent
              }%
            </div>

            <div className="result-risk">
              {result.risk_level}
            </div>

            <p>
              {riskDescription(
                result.risk_level
              )}
            </p>

          </div>


          <div className="result-summary-card">

            <span className="eyebrow">
              WORKFLOW
            </span>

            <h2>
              Predict → Explain → Intervene
            </h2>

            <div className="summary-line">
              <b>01</b>

              <span>
                Review the strongest model contributors.
              </span>
            </div>

            <div className="summary-line">
              <b>02</b>

              <span>
                Apply the recommended support actions.
              </span>
            </div>

            <div className="summary-line">
              <b>03</b>

              <span>
                Continue monitoring the student.
              </span>
            </div>

          </div>

        </div>


        <div className="result-detail-grid">

          <div className="white-card">

            <div className="card-title">

              <div>

                <span className="eyebrow">
                  EXPLAINABLE AI
                </span>

                <h2>
                  Why this prediction?
                </h2>

              </div>

              <div className="xai-badge">
                SHAP
              </div>

            </div>


            <div className="result-factors">

              {result.risk_factors?.length > 0 ? (

                result.risk_factors
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


          <div className="white-card">

            <div className="card-title">

              <div>

                <span className="eyebrow">
                  ACTION PLAN
                </span>

                <h2>
                  Recommended support
                </h2>

              </div>

            </div>


            <div className="intervention-results">

              {result.interventions?.length > 0 ? (

                result.interventions.map(
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
                )

              ) : (

                <div className="profile-empty">
                  No recommendations available.
                </div>

              )}

            </div>


            <div className="monitoring">

              <div>

                <span>
                  Monitoring schedule
                </span>

                <strong>
                  {result.monitoring}
                </strong>

              </div>

            </div>

          </div>

        </div>


        <div className="reassessment-banner">

          <div className="reassessment-icon">
            ✓
          </div>

          <div>

            <strong>
              Assessment saved
            </strong>

            <p>
              This assessment has been saved to the EduPredict AI database.
            </p>

          </div>

        </div>

      </div>
    );
  }


  return (
    <div>

      <section className="assessment-heading">

        <div>

          <span className="eyebrow">
            {reassessmentStudent
              ? "REASSESSMENT"
              : "AI ASSESSMENT"}
          </span>

          <h1>
            {reassessmentStudent
              ? `Reassess ${reassessmentStudent.name}`
              : "Assess student risk"}
          </h1>

          <p>
            Enter student information to generate an AI-powered dropout risk assessment.
          </p>

        </div>

      </section>


      <div className="assessment-layout">

        <div className="assessment-card">

          <div className="form-card-header">

            <div>

              <h2>
                Student information
              </h2>

              <p>
                These details identify the assessment record.
              </p>

            </div>

            <span>
              01
            </span>

          </div>


          <div className="form-section">

            <h3>
              Student details
            </h3>

            <div className="form-grid">

              <label>
                Student ID

                <input
                  type="text"
                  value={studentId}
                  placeholder="STU-1001"
                  onChange={(event) =>
                    setStudentId(
                      event.target.value
                    )
                  }
                />
              </label>


              <label>
                Student name

                <input
                  type="text"
                  value={studentName}
                  placeholder="Enter student name"
                  onChange={(event) =>
                    setStudentName(
                      event.target.value
                    )
                  }
                />
              </label>


              <label>
                Academic year

                <select
                  value={studentYear}
                  onChange={(event) =>
                    setStudentYear(
                      event.target.value
                    )
                  }
                >

                  <option value="">
                    Select year
                  </option>

                  <option value="1st Year">
                    1st Year
                  </option>

                  <option value="2nd Year">
                    2nd Year
                  </option>

                  <option value="3rd Year">
                    3rd Year
                  </option>

                  <option value="4th Year">
                    4th Year
                  </option>

                </select>

              </label>


              <label>
                Program

                <select
                  value={studentCourse}
                  onChange={(event) =>
                    setStudentCourse(
                      event.target.value
                    )
                  }
                >

                  <option value="">
                    Select program
                  </option>

                  <option value="B.Tech IT">
                    B.Tech IT
                  </option>

                  <option value="B.Tech CSE">
                    B.Tech CSE
                  </option>

                  <option value="B.Tech AIML">
                    B.Tech AI & ML
                  </option>

                </select>

              </label>

            </div>

          </div>


          <div className="form-section">

            <h3>
              Academic information
            </h3>

            <div className="form-grid">

              <label>
                Admission grade

                <input
                  type="number"
                  min="0"
                  max="200"
                  step="0.1"
                  name="admission_grade"
                  value={
                    student.admission_grade
                  }
                  onChange={
                    handleChange
                  }
                />

              </label>


              <label>
                Previous qualification grade

                <input
                  type="number"
                  min="0"
                  max="200"
                  step="0.1"
                  name="previous_qualification_grade"
                  value={
                    student.previous_qualification_grade
                  }
                  onChange={
                    handleChange
                  }
                />

              </label>


              <label>
                Age at enrollment

                <input
                  type="number"
                  min="15"
                  max="100"
                  name="age_at_enrollment"
                  value={
                    student.age_at_enrollment
                  }
                  onChange={
                    handleChange
                  }
                />

              </label>


              <label>
                Course

                <select
                  name="course"
                  value={
                    student.course
                  }
                  onChange={
                    handleChange
                  }
                >

                  {courseOptions.map(
                    (option) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {option.label}
                      </option>
                    )
                  )}

                </select>

              </label>

            </div>

          </div>


          <div className="form-section">

            <h3>
              Student support
            </h3>

            <div className="form-grid">

              <label>
                Gender

                <select
                  name="gender"
                  value={
                    student.gender
                  }
                  onChange={
                    handleChange
                  }
                >

                  {genderOptions.map(
                    (option) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {option.label}
                      </option>
                    )
                  )}

                </select>

              </label>


              <label>
                Attendance

                <select
                  name="daytime_evening_attendance"
                  value={
                    student.daytime_evening_attendance
                  }
                  onChange={
                    handleChange
                  }
                >

                  {attendanceOptions.map(
                    (option) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {option.label}
                      </option>
                    )
                  )}

                </select>

              </label>


              <label>
                Scholarship holder

                <select
                  name="scholarship_holder"
                  value={
                    student.scholarship_holder
                  }
                  onChange={
                    handleChange
                  }
                >

                  {yesNoOptions.map(
                    (option) => (
                      <option
                        key={
                          option.value
                        }
                        value={
                          option.value
                        }
                      >
                        {option.label}
                      </option>
                    )
                  )}

                </select>

              </label>


              <label>
                Tuition fees

                <select
                  name="tuition_fees_up_to_date"
                  value={
                    student.tuition_fees_up_to_date
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value={1}>
                    Up to date
                  </option>

                  <option value={0}>
                    Not up to date
                  </option>

                </select>

              </label>


              <label>
                Outstanding obligation

                <select
                  name="debtor"
                  value={
                    student.debtor
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value={0}>
                    No
                  </option>

                  <option value={1}>
                    Yes
                  </option>

                </select>

              </label>


              <label>
                Educational support needs

                <select
                  name="educational_special_needs"
                  value={
                    student.educational_special_needs
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value={0}>
                    No
                  </option>

                  <option value={1}>
                    Yes
                  </option>

                </select>

              </label>

            </div>

          </div>


          <div className="form-section">

            <h3>
              Background information
            </h3>

            <div className="form-grid">

              <label>
                Relocated for education

                <select
                  name="displaced"
                  value={
                    student.displaced
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value={1}>
                    Yes
                  </option>

                  <option value={0}>
                    No
                  </option>

                </select>

              </label>


              <label>
                International student

                <select
                  name="international"
                  value={
                    student.international
                  }
                  onChange={
                    handleChange
                  }
                >

                  <option value={0}>
                    No
                  </option>

                  <option value={1}>
                    Yes
                  </option>

                </select>

              </label>

            </div>

          </div>


          <div className="form-actions">

            <button
              type="button"
              className="ghost-button"
              onClick={resetForm}
              disabled={loading}
            >
              Reset
            </button>


            <button
              type="button"
              className="primary-button"
              onClick={assessRisk}
              disabled={loading}
            >
              {loading
                ? "Analyzing..."
                : "Analyze Risk"}
            </button>

          </div>


          {error && (
            <div className="error">
              {error}
            </div>
          )}

        </div>


        <div className="assessment-side">

          <div className="side-info-card">

            <span className="eyebrow">
              AI WORKFLOW
            </span>

            <h2>
              From prediction to action.
            </h2>

            <div className="steps">

              <div>

                <b>01</b>

                <div>

                  <strong>
                    Predict
                  </strong>

                  <span>
                    Estimate dropout probability
                  </span>

                </div>

              </div>


              <div>

                <b>02</b>

                <div>

                  <strong>
                    Explain
                  </strong>

                  <span>
                    Understand influential factors
                  </span>

                </div>

              </div>


              <div>

                <b>03</b>

                <div>

                  <strong>
                    Intervene
                  </strong>

                  <span>
                    Create targeted support
                  </span>

                </div>

              </div>

            </div>

          </div>


          <div className="dark-info-card">

            <span className="eyebrow">
              EARLY SUPPORT
            </span>

            <h3>
              Identify risk before it becomes critical.
            </h3>

            <p>
              EduPredict AI combines machine learning,
              explainability, and intervention tracking
              in one workflow.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Assessment;