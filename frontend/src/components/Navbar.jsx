function Navbar() {
  return (
    <nav className="navbar">
      <div className="brand">
        <div className="brand-logo">
          E
        </div>

        <div>
          <h2>EduPredict AI</h2>
          <span>Student Early Warning System</span>
        </div>
      </div>

      <div className="nav-links">
        <button>Dashboard</button>
        <button>Assess Student</button>
        <button>Analytics</button>
      </div>
    </nav>
  );
}

export default Navbar;