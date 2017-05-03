import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Menu } from 'semantic-ui-react';

function Sidebar(props) {
  return (
    <Menu secondary vertical fluid>
      <Menu.Item name="Dashboard" as={Link} to="/admin/dashboard" active={props.location.pathname === '/admin/dashboard'} />
      <Menu.Item name="Users" as={Link} to="/admin/users" active={props.location.pathname === '/admin/users'} />
    </Menu>
  );
}

Sidebar.propTypes = {
  location: PropTypes.object,
};

export default Sidebar;
