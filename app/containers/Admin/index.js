import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import Sidebar from './sideBar/';
import styled from 'styled-components';

const AdminContainerStyled = styled(Grid.Column)`
  padding: 45px 51px 0 51px !important;
`;

function AdminPage(props) { // eslint-disable-line react/prefer-stateless-function
  return (
    <div className={props.className}>
      <Grid stackable>
        <Grid.Row>
          <Grid.Column width={4}>
            {<Sidebar {...props} />}
          </Grid.Column>
          <AdminContainerStyled width={12}>
            {props.children}
          </AdminContainerStyled>
        </Grid.Row>
      </Grid>
    </div>
  );
}

AdminPage.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any,
};

export default AdminPage;
