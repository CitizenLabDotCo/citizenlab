import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// components
import HelmetIntl from 'components/HelmetIntl';
import GroupsListPanel from './GroupsListPanel';

// Global state
import { globalState, IAdminNoPadding, IGlobalStateService } from 'services/globalState';

// Styling
import styled from 'styled-components';

const Wrapper = styled.div`
  align-items: stretch;
  display: flex;
  flex-wrap: nowrap;
  height: 100%;
`;

const LeftPanel = styled(GroupsListPanel)`
  flex: 0 0 320px;
`;

const ChildWrapper = styled.div`
  background: white;
  flex: 1;
  padding: 50px;
`;

// i18n
import messages from './messages';

interface Props {}

class UsersPage extends React.Component<Props & WithRouterProps> {
  globalState: IGlobalStateService<IAdminNoPadding>;

  constructor(props: Props & WithRouterProps) {
    super(props);
    this.globalState = globalState.init('AdminNoPadding', { enabled: true });
  }

  componentDidMount() {
    this.globalState.set({ enabled: true });
  }

  componentWillUnmount() {
    this.globalState.set({ enabled: false });
  }

  render () {
    if (!this.props.location) return null;

    return (
      <>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <Wrapper>
          <LeftPanel />
          <ChildWrapper>{this.props.children}</ChildWrapper>
        </Wrapper>
      </>
    );
  }
}

export default withRouter<Props>(UsersPage);
