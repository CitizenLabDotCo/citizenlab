import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import Sidebar from './SideBar/';

function AdminPage(props) { // eslint-disable-line react/prefer-stateless-function
  return (
    <div>
      <Grid stackable>
        <Grid.Row>
          <Grid.Column width={3}>
            {<Sidebar {...props} />}
          </Grid.Column>
          <Grid.Column width={10}>
            {props.children}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </div>
  );
}

AdminPage.propTypes = {
  children: PropTypes.any,
};

export default AdminPage;
