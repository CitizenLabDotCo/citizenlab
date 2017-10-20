import React from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import Sidebar from './sideBar/';
import styled from 'styled-components';

const AdminContainerStyled = styled(Grid.Column)`
  max-width: 1200px;
  padding: 45px 51px 0 51px !important;
`;

const LeftColumn = styled.div`
  width: 260px;
`;

const RightColumn = styled.div`
  width: calc(100% - 210px);
  /* height: calc(100vh - 74px); */
  height: 100%;
  min-height: calc(100vh - ${(props) => props.theme.menuHeight}px - 1px);
  margin-left: 210px;
  display: inline-block;
  background-color: #f2f2f2;
`;

function AdminPage(props) { // eslint-disable-line react/prefer-stateless-function
  return (
    <div className={props.className}>
      <LeftColumn>
        {<Sidebar {...props} />}
      </LeftColumn>
      <RightColumn>
        <AdminContainerStyled width={12}>
          {props.children}
        </AdminContainerStyled>
      </RightColumn>
    </div>
  );
}

AdminPage.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any,
};

export default AdminPage;
