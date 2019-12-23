// Libraries
import React, { PureComponent } from 'react';

// Components
import ConsentForm from 'components/ConsentForm';
import InitialUnsubscribeFeedback from './InitialUnsubscribeFeedback';

// Styles
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { withRouter, WithRouterProps } from 'react-router';

// services
import { updateConsentByCampaignIDWIthToken } from 'services/campaignConsents';

const Container = styled.div`
  width: 100%;
  background-color: ${colors.background};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 30px;
  padding-bottom: 50px;
  overflow-x: hidden;
`;

interface Props { }

interface State {
  initialUnsubscribeStatus: 'error' | 'success' | 'loading' | null;
}

export class EmailSettingPage extends PureComponent<Props & WithRouterProps, State> {

  constructor(props: Props & WithRouterProps) {
    super(props);
    this.state = {
      initialUnsubscribeStatus: null
    };
  }

  componentDidMount() {
    const { query } = this.props.location;

    this.setState({ initialUnsubscribeStatus: 'loading' });
    if (typeof query.unsubscription_token === 'string' && typeof query.campaign_id === 'string') {
      updateConsentByCampaignIDWIthToken(query.campaign_id, false, query.unsubscription_token).then(() => {
        this.setState({ initialUnsubscribeStatus: 'success' });
      }).catch(() => {
        this.setState({ initialUnsubscribeStatus: 'error' });
      });
    }

  }

  render() {
    const { initialUnsubscribeStatus } = this.state;
    return (
      <Container id="e2e-user-edit-profile-page">
        {initialUnsubscribeStatus && (
          <InitialUnsubscribeFeedback status={initialUnsubscribeStatus} />
        )}
        {/* <ConsentForm consents={} /> */}
      </Container>
    );
  }
}
export default withRouter(EmailSettingPage);
