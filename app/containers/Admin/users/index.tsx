import React from 'react';

// components
import HelmetIntl from 'components/HelmetIntl';
import GroupsListPanel from './GroupsListPanel';

// resources
import GetLocation, { GetLocationChildProps } from 'resources/GetLocation';

// Global state
import { globalState, IAdminNoPadding, IGlobalStateService } from 'services/globalState';

// Styling
import styled from 'styled-components';

const Wrapper = styled.div`
  align-items: stretch;
  display: flex;
  flex-wrap: nowrap;
  heigth: 100%;
`;

const LeftPanel = styled(GroupsListPanel)`
  flex: 0 0 320px;
`;

const ChildWrapper = styled.div`
  background: white;
  flex: 1;
`;

// i18n
import messages from './messages';

interface InputProps {}

interface DataProps {
  location: GetLocationChildProps;
}

interface Props extends InputProps, DataProps {}

export class UsersPage extends React.Component<Props> {
  globalState: IGlobalStateService<IAdminNoPadding>;

  constructor(props) {
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

export default (inputProps: InputProps) => (
  <GetLocation>
    {location => <UsersPage {...inputProps} location={location} />}
  </GetLocation>
);
