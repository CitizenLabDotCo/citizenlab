import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import Sidebar from './sideBar/';

// style
import styled from 'styled-components';

const LeftColumn = styled.div`
  width: 260px;
`;

const RightColumn = styled.div`
  width: calc(100% - 210px);
  margin-left: 210px;
  display: inline-block;
  background-color: #f2f2f2;
`;

const AdminContainerStyled = styled.div`
  display: flex;
  flex-direction: column;
  padding: 45px 51px 0px 51px;
`;

type Props = {};

type State = {};

export default class AdminPage extends React.PureComponent<Props, State> {
  render() {
    const className = this.props['className'];
    const children = this.props['children'];

    return (
      <div className={className}>
        <LeftColumn>
          {<Sidebar {...this.props} />}
        </LeftColumn>
        <RightColumn>
          <AdminContainerStyled>
            {children}
          </AdminContainerStyled>
        </RightColumn>
      </div>
    );
  }
}
