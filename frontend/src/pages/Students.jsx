import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import { API_URL } from "../config";


function Students() {
  const [students, setStudents] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [riskFilter, setRiskFilter] =
    useState("ALL");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  async function loadStudents() {
    try {
      setLoading(true);
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

      setStudents(
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

          year:
            item.year ||
            "—",

          probability:
            Number(
              item.probability || 0
            ),

          risk:
            item.risk ||
            "LOW",

          monitoring:
            item.monitoring ||
            "Monthly",

          createdAt:
            item.created_at ||
            null,
        }))
      );
    } catch (err) {
      console.error(err);

      setError(
        "Could not load students from the database."
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    loadStudents();
  }, []);


  const filteredStudents =
    useMemo(() => {
      const text =
        search
          .toLowerCase()
          .trim();

      return students.filter(
        (student) => {

          const matchesSearch =
            !text ||
            student.name
              .toLowerCase()
              .includes(text) ||
            student.id
              .toLowerCase()
              .includes(text) ||
            student.course
              .toLowerCase()
              .includes(text);

          const matchesRisk =
            riskFilter === "ALL" ||
            student.risk ===
              riskFilter;

          return (
            matchesSearch &&
            matchesRisk
          );
        }
      );
    }, [
      students,
      search,
      riskFilter,
    ]);


  const highRisk =
    students.filter(
      (student) =>
        student.risk === "HIGH"
    ).length;


  const mediumRisk =
    students.filter(
      (student) =>
        student.risk === "MEDIUM"
    ).length;


  const lowRisk =
    students.filter(
      (student) =>
        student.risk === "LOW"
    ).length;


  if (loading) {
    return (
      <div className="placeholder-page">

        <div className="empty-students-icon">
          ...
        </div>

        <h1>
          Loading students
        </h1>

        <p>
          Fetching records from the database.
        </p>

      </div>
    );
  }


  if (error) {
    return (
      <div className="placeholder-page">

        <div className="empty-students-icon">
          !
        </div>

        <h1>
          Unable to load students
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


  return (
    <div>

      <div className="page-heading">

        <div>

          <span className="eyebrow">
            STUDENT MANAGEMENT
          </span>

          <h1>
            Student directory
          </h1>

          <p>
            Search, filter, and monitor assessed students.
          </p>

        </div>

      </div>


      <div className="student-summary">

        <div className="student-summary-card">

          <span>
            Assessed students
          </span>

          <strong>
            {students.length}
          </strong>

        </div>


        <div className="student-summary-card high-summary">

          <span>
            High risk
          </span>

          <strong>
            {highRisk}
          </strong>

        </div>


        <div className="student-summary-card medium-summary">

          <span>
            Monitoring
          </span>

          <strong>
            {mediumRisk}
          </strong>

        </div>


        <div className="student-summary-card low-summary">

          <span>
            Stable
          </span>

          <strong>
            {lowRisk}
          </strong>

        </div>

      </div>


      <div className="student-table-card">

        <div className="student-table-header">

          <div>

            <span className="eyebrow">
              STUDENT DIRECTORY
            </span>

            <h2>
              Risk monitoring
            </h2>

          </div>

          <span className="student-count">
            {filteredStudents.length} shown
          </span>

        </div>


        <div className="student-filters">

          <div className="student-search-box">

            <span>
              ⌕
            </span>

            <input
              type="text"
              value={search}
              placeholder="Search by name, ID or program..."
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
              >
                ×
              </button>
            )}

          </div>


          <div className="risk-filter-group">

            {[
              "ALL",
              "HIGH",
              "MEDIUM",
              "LOW",
            ].map(
              (filter) => (
                <button
                  type="button"
                  key={filter}
                  className={
                    riskFilter === filter
                      ? "risk-filter active"
                      : "risk-filter"
                  }
                  onClick={() =>
                    setRiskFilter(
                      filter
                    )
                  }
                >
                  {filter === "ALL"
                    ? "All"
                    : filter}
                </button>
              )
            )}

          </div>

        </div>


        {filteredStudents.length === 0 ? (

          <div className="empty-students">

            <div className="empty-students-icon">
              +
            </div>

            <h2>
              No matching students
            </h2>

            <p>
              Try a different search or filter.
            </p>

            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setSearch("");
                setRiskFilter(
                  "ALL"
                );
              }}
            >
              Clear filters
            </button>

          </div>

        ) : (

          <div className="student-table">

            <div className="student-table-row table-header">

              <span>
                Student
              </span>

              <span>
                Program
              </span>

              <span>
                Risk
              </span>

              <span>
                Probability
              </span>

              <span>
                Monitoring
              </span>

              <span>
                Assessed
              </span>

              <span>
              </span>

            </div>


            {filteredStudents.map(
              (student) => (

                <div
                  className="student-table-row"
                  key={student.id}
                >

                  <div className="student-name-cell">

                    <div className="student-list-avatar">
                      {student.name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>

                      <strong>
                        {student.name}
                      </strong>

                      <small>
                        {student.id}
                      </small>

                    </div>

                  </div>


                  <span>
                    {student.course}
                  </span>


                  <span>

                    <span
                      className={
                        `risk-tag ${student.risk.toLowerCase()}`
                      }
                    >
                      {student.risk}
                    </span>

                  </span>


                  <strong className="probability">
                    {student.probability}%
                  </strong>


                  <span className="student-status">
                    {student.monitoring}
                  </span>


                  <span className="student-status">
                    {student.createdAt
                      ? new Date(
                          student.createdAt
                        ).toLocaleDateString()
                      : "—"}
                  </span>


                  <Link
                    to={`/students/${student.id}`}
                    className="view-student"
                  >
                    View →
                  </Link>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default Students;