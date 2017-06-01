import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Menu } from 'semantic-ui-react';
import { injectIntl, intlShape } from 'react-intl';

import messages from './messages';

function Sidebar(props) {
  const { formatMessage } = props.intl;

  return (
    <Menu vertical borderless>
      <Menu.Item name={formatMessage({ ...messages.dashboard })} as={Link} to="/admin/dashboard" active={props.location.pathname === '/admin/dashboard'} />
      <Menu.Item name={formatMessage({ ...messages.ideas })} as={Link} to="/admin/ideas" active={props.location.pathname === '/admin/ideas'} />
      <Menu.Item name={formatMessage({ ...messages.users })} as={Link} to="/admin/users" active={props.location.pathname === '/admin/users'} />
      <Menu.Item name={formatMessage({ ...messages.pages })} as={Link} to="/admin/pages" active={props.location.pathname === '/admin/pages'} />
      <Menu.Item name={formatMessage({ ...messages.projects })} as={Link} to="/admin/projects" active={props.location.pathname === '/admin/projects'} />
      <Menu.Item name={formatMessage({ ...messages.areas })} as={Link} to="/admin/areas" active={props.location.pathname === '/admin/areas'} />

    </Menu>
  );
}

Sidebar.propTypes = {
  location: PropTypes.object,
  intl: intlShape.isRequired,
};

export default injectIntl(Sidebar);
