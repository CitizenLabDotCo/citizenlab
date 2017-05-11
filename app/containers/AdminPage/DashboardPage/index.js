import React from 'react';
import PropTypes from 'prop-types';

function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
    </div>
  );
}

DashboardPage.propTypes = {
  location: PropTypes.object,
};

export default DashboardPage;
