import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import Sidebar from './sideBar/';

// style
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
`;

const LeftColumn = styled.div`
  flex: 0 0 240px;
`;

const RightColumn = styled.div`
  flex: 1;
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
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
    const { children } = this.props;

    return (
      <Container className={className}>
        <LeftColumn>
          {<Sidebar {...this.props} />}
        </LeftColumn>
        <RightColumn>
          <AdminContainerStyled>
            {children}
          </AdminContainerStyled>
        </RightColumn>
      </Container>
    );
  }
}
