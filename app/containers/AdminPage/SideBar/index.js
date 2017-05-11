import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Menu } from 'semantic-ui-react';
import { createStructuredSelector } from 'reselect';
import { makeSelectCurrentTenant } from './selectors';

class Sidebar extends React.Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    const menu = {
      background: this.props.tenant.getIn(['attributes', 'settings', 'core', 'style_accent_bg']),
    };

    return (
      <Menu style={menu} secondary vertical fluid>
        <Menu.Item name="Dashboard" as={Link} to="/admin/dashboard" active={this.props.location.pathname === '/admin/dashboard'} />
        <Menu.Item name="Users" as={Link} to="/admin/users" active={this.props.location.pathname === '/admin/users'} />
        <Menu.Item name="Ideas" as={Link} to="/admin/ideas" active={this.props.location.pathname === '/admin/ideas'} />
        <Menu.Item name="Settings" as={Link} to="/admin/settings" active={this.props.location.pathname === '/admin/settings'} />
      </Menu>
    );
  }
}

Sidebar.propTypes = {
  location: PropTypes.object.isRequired,
  tenant: PropTypes.object.isRequired,
};

const mapStateToProps = createStructuredSelector({
  tenant: makeSelectCurrentTenant(),
});

export default connect(mapStateToProps, null)(Sidebar);
