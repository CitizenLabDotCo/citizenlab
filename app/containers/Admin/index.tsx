import React from 'react';
import { Subscription } from 'rxjs/Subscription';
import { globalState, IAdminFullWidth, IGlobalStateService } from 'services/globalState';
import Sidebar from './sideBar/';
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
`;

const RightColumn = styled.div`
  flex: 1;
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  background: ${colors.background};
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
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      adminFullWidth: false,
    };
    this.globalState = globalState.init('AdminFullWidth', { enabled: false });
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
      <>
        <Container className={className}>
          <Sidebar />
          <RightColumn>
            <AdminContainerStyled adminFullWidth={adminFullWidth}>
              {children}
            </AdminContainerStyled>
          </RightColumn>
        </Container>
      </>
    );
  }
}
