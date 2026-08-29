import {
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import { API_URL } from "../config";


const defaultPlan = [
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


function Interventions() {
  const [students, setStudents] =
    useState([]);

  const [selectedStudent, setSelectedStudent] =
    useState(null);

  const [interventions, setInterventions] =
    useState([]);

  const [loadingStudents, setLoadingStudents] =
    useState(true);

  const [loadingPlan, setLoadingPlan] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");


  async function loadStudents() {
    try {
      setLoadingStudents(true);
      setError("");

      const response =
        await fetch(
          `${API_URL}/assessments`
        );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      const data =
        await response.json();

      const latestByStudent = {};

      for (const item of data) {
        const id =
          item.student_id ||
          item.id;

        if (!id) {
          continue;
        }

        const existing =
          latestByStudent[id];

        if (
          !existing ||
          new Date(
            item.created_at || 0
          ) >
            new Date(
              existing.created_at || 0
            )
        ) {
          latestByStudent[id] =
            item;
        }
      }

      const list =
        Object.values(
          latestByStudent
        ).map((item) => ({
          id:
            item.student_id ||
            item.id,

          name:
            item.student_name ||
            "Student",

          course:
            item.course ||
            "—",

          probability:
            Number(
              item.probability || 0
            ),

          risk:
            item.risk ||
            "LOW",
        }));

      setStudents(list);

      if (list.length > 0) {
        setSelectedStudent(list[0]);
      }

    } catch (err) {
      console.error(err);

      setError(
        "Could not load students from the database."
      );
    } finally {
      setLoadingStudents(false);
    }
  }


  async function loadInterventions(
    studentId
  ) {
    try {
      setLoadingPlan(true);

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

      setError(
        "Could not load intervention plan."
      );

    } finally {
      setLoadingPlan(false);
    }
  }


  useEffect(() => {
    loadStudents();
  }, []);


  useEffect(() => {
    if (selectedStudent) {
      loadInterventions(
        selectedStudent.id
      );
    }
  }, [selectedStudent]);


  async function createPlan() {
    if (!selectedStudent) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response =
        await fetch(
          `${API_URL}/students/${selectedStudent.id}/interventions`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                defaultPlan
              ),
          }
        );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

      await loadInterventions(
        selectedStudent.id
      );

    } catch (err) {
      console.error(err);

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
      setError("");

      const response =
        await fetch(
          `${API_URL}/students/${selectedStudent.id}/interventions`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify(
                updated
              ),
          }
        );

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}`
        );
      }

    } catch (err) {
      console.error(err);

      setError(
        "Could not save intervention progress."
      );

      await loadInterventions(
        selectedStudent.id
      );

    } finally {
      setSaving(false);
    }
  }


  const completedCount =
    interventions.filter(
      (item) =>
        item.status === "completed"
    ).length;


  const totalCount =
    interventions.length;


  const progress =
    totalCount === 0
      ? 0
      : Math.round(
          (completedCount /
            totalCount) *
            100
        );


  if (loadingStudents) {
    return (
      <div className="placeholder-page">

        <div className="empty-students-icon">
          ...
        </div>

        <h1>
          Loading interventions
        </h1>

        <p>
          Fetching students from the database.
        </p>

      </div>
    );
  }


  if (error && students.length === 0) {
    return (
      <div className="placeholder-page">

        <div className="empty-students-icon">
          !
        </div>

        <h1>
          Unable to load interventions
        </h1>

        <p>
          {error}
        </p>

        <button
          type="button"
          className="primary-button"
          onClick={loadStudents}
        >
          Try again
        </button>

      </div>
    );
  }


  if (students.length === 0) {
    return (
      <div className="placeholder-page">

        <div className="empty-students-icon">
          +
        </div>

        <h1>
          No students yet
        </h1>

        <p>
          Complete an assessment first.
        </p>

        <Link
          to="/assessment"
          className="primary-button"
        >
          Assess student →
        </Link>

      </div>
    );
  }


  return (
    <div>

      <div className="page-heading">

        <div>

          <span className="eyebrow">
            INTERVENTION CENTER
          </span>

          <h1>
            Student support plans
          </h1>

          <p>
            Track support actions and intervention progress.
          </p>

        </div>

      </div>


      <div className="intervention-layout">

        <div className="intervention-student-panel">

          <div className="panel-heading">

            <span className="eyebrow">
              STUDENTS
            </span>

            <h2>
              Select student
            </h2>

          </div>


          <div className="intervention-student-list">

            {students.map(
              (student) => (

                <button
                  type="button"
                  key={student.id}
                  className={
                    selectedStudent?.id ===
                    student.id
                      ? "intervention-student active"
                      : "intervention-student"
                  }
                  onClick={() =>
                    setSelectedStudent(
                      student
                    )
                  }
                >

                  <div className="intervention-avatar">
                    {student.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>


                  <div className="intervention-student-info">

                    <strong>
                      {student.name}
                    </strong>

                    <span>
                      {student.id}
                    </span>

                  </div>


                  <span
                    className={
                      `risk-tag ${student.risk.toLowerCase()}`
                    }
                  >
                    {student.risk}
                  </span>

                </button>

              )
            )}

          </div>

        </div>


        <div className="intervention-main-panel">

          {selectedStudent && (

            <>

              <div className="intervention-header">

                <div>

                  <span className="eyebrow">
                    CURRENT STUDENT
                  </span>

                  <h2>
                    {selectedStudent.name}
                  </h2>

                  <p>
                    {selectedStudent.id}
                    {" · "}
                    {selectedStudent.course}
                  </p>

                </div>


                <div className="intervention-risk">

                  <span>
                    CURRENT RISK
                  </span>

                  <strong>
                    {selectedStudent.probability}%
                  </strong>

                  <span
                    className={
                      `risk-tag ${selectedStudent.risk.toLowerCase()}`
                    }
                  >
                    {selectedStudent.risk}
                  </span>

                </div>

              </div>


              {loadingPlan ? (

                <div className="empty-students">

                  <h2>
                    Loading support plan
                  </h2>

                </div>

              ) : interventions.length === 0 ? (

                <div className="empty-students">

                  <div className="empty-students-icon">
                    +
                  </div>

                  <h2>
                    No support plan yet
                  </h2>

                  <p>
                    Create a 30-day plan for this student.
                  </p>

                  <button
                    type="button"
                    className="primary-button"
                    disabled={saving}
                    onClick={
                      createPlan
                    }
                  >
                    {saving
                      ? "Creating..."
                      : "Create support plan"}
                  </button>

                </div>

              ) : (

                <>

                  <div className="intervention-progress-card">

                    <div className="progress-heading">

                      <div>

                        <span>
                          30-DAY SUPPORT PLAN
                        </span>

                        <strong>
                          Intervention progress
                        </strong>

                      </div>

                      <div className="progress-big">
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


                    <div className="progress-info">

                      <span>
                        {completedCount} of{" "}
                        {totalCount} completed
                      </span>

                      <span>
                        {saving
                          ? "Saving..."
                          : progress ===
                              100
                            ? "Complete"
                            : "In progress"}
                      </span>

                    </div>

                  </div>


                  <div className="plan-timeline">

                    {interventions.map(
                      (item) => {

                        const completed =
                          item.status ===
                          "completed";

                        return (
                          <div
                            className={
                              completed
                                ? "plan-item completed"
                                : "plan-item"
                            }
                            key={item.id}
                          >

                            <div className="plan-marker">

                              {completed
                                ? "✓"
                                : item.week}

                            </div>


                            <div className="plan-content">

                              <div className="plan-meta">

                                <span>
                                  WEEK{" "}
                                  {item.week}
                                </span>

                                <button
                                  type="button"
                                  disabled={
                                    saving
                                  }
                                  onClick={() =>
                                    toggleIntervention(
                                      item.id
                                    )
                                  }
                                >
                                  {completed
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
                                {completed
                                  ? "✓ Completed"
                                  : "○ Pending"}
                              </div>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                </>

              )}

            </>

          )}

        </div>

      </div>

    </div>
  );
}

export default Interventions;