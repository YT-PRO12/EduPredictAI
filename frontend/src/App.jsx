import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Assessment from "./pages/Assessment";
import Students from "./pages/Students";
import Interventions from "./pages/Interventions";
import Analytics from "./pages/Analytics";
import StudentProfile from "./pages/StudentProfile";

import "./App.css";


function App() {

  return (
    <BrowserRouter>

      <div className="app">

        {/* ================= SIDEBAR ================= */}

        <aside className="sidebar">

          <div className="brand">

            <div className="brand-logo">
              E
            </div>

            <div>
              <strong>
                EduPredict AI
              </strong>

              <span>
                Student Intelligence
              </span>
            </div>

          </div>


          <div className="nav-title">
            MAIN MENU
          </div>


          <nav>

            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              Dashboard
            </NavLink>


            <NavLink
              to="/assessment"
              className={({ isActive }) =>
                isActive
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              Assess Student
            </NavLink>

<NavLink
  to="/analytics"
  className={({ isActive }) =>
    isActive
      ? "nav-link active"
      : "nav-link"
  }
>
  Analytics
</NavLink>


            <NavLink
              to="/interventions"
              className={({ isActive }) =>
                isActive
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              Interventions
            </NavLink>

          </nav>


          <div className="sidebar-bottom">

            <div className="model-status">

              <div className="model-status-icon">
                AI
              </div>

              <div>
                <strong>
                  AI Model
                </strong>

                <span>
                  Operational
                </span>
              </div>

              <span className="green-dot"></span>

            </div>


            <div className="admin-profile">

              <div className="avatar">
                A
              </div>

              <div>
                <strong>
                  Admin User
                </strong>

                <span>
                  Education Team
                </span>
              </div>

            </div>

          </div>

        </aside>


        {/* ================= MAIN ================= */}

        <div className="main">


          <header className="topbar">

            <div className="search">

              <input
                placeholder="Search students..."
              />

            </div>


            <div className="topbar-actions">

              <button className="icon-button">
                •
              </button>

              <div className="top-avatar">
                A
              </div>

            </div>

          </header>


          <main className="content">

            <Routes>

              <Route
                path="/"
                element={
                  <Dashboard />
                }
              />

              <Route
                path="/dashboard"
                element={
                  <Dashboard />
                }
              />

              <Route
                path="/assessment"
                element={
                  <Assessment />
                }
              />

              <Route
                path="/students"
                element={
                  <Students />
                }
              />

              <Route
                path="/interventions"
                element={
                  <Interventions />
                }
              />

              <Route
                path="/analytics"
                element={
                  <Analytics />
                }
              />
              <Route
  path="/students/:studentId"
  element={<StudentProfile />}
/>

            </Routes>

          </main>

        </div>

      </div>

    </BrowserRouter>
  );
}

export default App;