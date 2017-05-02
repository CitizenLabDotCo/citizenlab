/**
*
* Sidebar
*
*/

import React from 'react';
import { Link } from 'react-router';
import { Dropdown, Icon, Menu } from 'semantic-ui-react';

function Sidebar() {
  return (
    <Menu vertical>
      <Menu.Item>
        Home

        <Menu.Menu>
          <Menu.Item>
            <Link to="/admin/users">Users</Link>
          </Menu.Item>
          <Menu.Item name="add">
            Add
          </Menu.Item>
          <Menu.Item name="about">
            Remove
          </Menu.Item>
        </Menu.Menu>
      </Menu.Item>

      <Menu.Item name="browse">
        <Icon name="grid layout" />
        Browse
      </Menu.Item>
      <Menu.Item name="messages">
        Messages
      </Menu.Item>

      <Dropdown item text="More">
        <Dropdown.Menu>
          <Dropdown.Item icon="edit" text="Edit Profile" />
          <Dropdown.Item icon="globe" text="Choose Language" />
          <Dropdown.Item icon="settings" text="Account Settings" />
        </Dropdown.Menu>
      </Dropdown>
    </Menu>
  );
}

export default Sidebar;
