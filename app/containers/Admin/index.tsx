import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { globalState, IAdminFullWidth, IAdminNoPadding, IGlobalStateService } from 'services/globalState';

// components
import Sidebar from './sideBar/';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
`;

const RightColumn = styled.div`
  background: ${colors.background};
  display: flex;
  flex-direction: column;
  flex: 1;
  max-width: 1200px;
  min-height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  padding: 45px 51px 0px 51px;

  &.fullWidth {
    max-width: none;
  }

  &.noPadding {
    padding: 0;
    max-width: none;
  }
`;

type Props = {};

type State = {
  adminFullWidth: boolean;
  adminNoPadding: boolean;
};

export default class AdminPage extends React.PureComponent<Props, State> {
  FullWidth: IGlobalStateService<IAdminFullWidth>;
  NoPadding: IGlobalStateService<IAdminNoPadding>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      adminFullWidth: false,
      adminNoPadding: false,
    };
    this.FullWidth = globalState.init('AdminFullWidth', { enabled: false });
    this.NoPadding = globalState.init('AdminNoPadding', { enabled: false });
  }

  componentDidMount() {
    const FullWidth$ = this.FullWidth.observable;
    const NoPadding$ = this.NoPadding.observable;

    this.subscriptions = [
      FullWidth$.subscribe(({ enabled }) => this.setState({ adminFullWidth: enabled })),
      NoPadding$.subscribe(({ enabled }) => this.setState({ adminNoPadding: enabled })),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;

    // Merging classes
    const classes: string[] = [];
    if (this.state.adminFullWidth) classes.push('fullWidth');
    if (this.state.adminNoPadding) classes.push('noPadding');

    return (
      <>
        <Container className={this.props['className']}>
          <Sidebar />
          <RightColumn className={classes.join(' ')}>
            {children}
          </RightColumn>
        </Container>
      </>
    );
  }
}
