import React from 'react';
import PropTypes from 'prop-types';

function DashboardPage() {
  return (
    <h1>Dashboard</h1>
  );
}

DashboardPage.propTypes = {
  location: PropTypes.object,
};

export default DashboardPage;
