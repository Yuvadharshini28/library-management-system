import React from 'react';

const StatCard = ({ title, value, description, icon: Icon, colorClass = 'stat-blue' }) => {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <h3>{title}</h3>
        <div className="stat-value">{value}</div>
        {description && <div className="stat-desc">{description}</div>}
      </div>
      <div className={`stat-icon-wrapper ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
  );
};

export default StatCard;
