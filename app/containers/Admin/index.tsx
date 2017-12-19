import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import { globalState, IAdminFullWidth, IGlobalStateService } from 'services/globalState';

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

const AdminContainerStyled = styled<any, 'div'>('div')`
  display: flex;
  flex-direction: column;
  ${(props) => props.adminFullWidth ? '' : 'max-width: 1200px;'}
  padding: 45px 51px 0px 51px;
`;

type Props = {};

type State = {
  adminFullWidth: boolean;
};

export default class AdminPage extends React.PureComponent<Props, State> {
  globalState: IGlobalStateService<IAdminFullWidth>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      adminFullWidth: false,
    };
    this.globalState = globalState.init<IAdminFullWidth>('AdminFullWidth', { enabled: false });
  }

  componentDidMount() {
    const globalState$ = this.globalState.observable;
    this.subscriptions = [
      globalState$.subscribe(({ enabled }) => this.setState({ adminFullWidth: enabled }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const className = this.props['className'];
    const { children } = this.props;
    const { adminFullWidth } = this.state;

    return (
      <Container className={className}>
        <LeftColumn>
          {<Sidebar {...this.props} />}
        </LeftColumn>
        <RightColumn>
          <AdminContainerStyled adminFullWidth={adminFullWidth}>
            {children}
          </AdminContainerStyled>
        </RightColumn>
      </Container>
    );
  }
}
