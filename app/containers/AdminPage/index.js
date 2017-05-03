import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Grid } from 'semantic-ui-react';
import Sidebar from './Sidebar/';

const Wrapper = styled.div`
  padding-top: 100px;
`;

function AdminPage(props) { // eslint-disable-line react/prefer-stateless-function
  return (
    <div>
      <Wrapper>
        <Grid stackable>
          <Grid.Row>
            <Grid.Column width={3}>
              <Sidebar {...props} />
            </Grid.Column>
            <Grid.Column width={10}>
              {props.children}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Wrapper>
    </div>
  );
}

AdminPage.propTypes = {
  children: PropTypes.any,
};

export default AdminPage;
