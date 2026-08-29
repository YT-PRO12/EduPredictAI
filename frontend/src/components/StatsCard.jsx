function StatsCard({
  title,
  value,
  description
}) {
  return (
    <div className="stats-card">

      <p>
        {title}
      </p>

      <h3>
        {value}
      </h3>

      <span>
        {description}
      </span>

    </div>
  );
}

export default StatsCard;