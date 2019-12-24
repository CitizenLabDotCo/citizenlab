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
import { adopt } from 'react-adopt';
import GetCampaignConsentsWithToken, { GetCampaignConsentsWithTokenChildProps } from 'resources/GetCampaignConsentsWithToken';
import { isNilOrError } from 'utils/helperUtils';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

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

interface DataProps {
  consents: GetCampaignConsentsWithTokenChildProps;
}

interface State {
  initialUnsubscribeStatus: 'error' | 'success' | 'loading' | null;
}

export class EmailSettingPage extends PureComponent<DataProps & WithRouterProps, State> {

  constructor(props: DataProps & WithRouterProps) {
    super(props);
    this.state = {
      initialUnsubscribeStatus: null
    };
  }

  componentDidMount() {
    const { query } = this.props.location;

    if (!(typeof query.unsubscription_token === 'string' && typeof query.campaign_id === 'string')) {
      this.setState({ initialUnsubscribeStatus: 'error' });
    } else {
      this.setState({ initialUnsubscribeStatus: 'loading' });
      updateConsentByCampaignIDWIthToken(query.campaign_id, false, query.unsubscription_token).then(() => {
        this.setState({ initialUnsubscribeStatus: 'success' });
        streams.fetchAllWith({
          apiEndpoint: [`${API_PATH}/consents?unsubscription_token=${query.unsubscription_token}`],
        });
      }).catch(() => {
        this.setState({ initialUnsubscribeStatus: 'error' });
      });
    }
  }

  render() {
    const { initialUnsubscribeStatus } = this.state;
    const { consents, location } = this.props;
    const token = typeof location.query.unsubscription_token === 'string'
      ? location.query.unsubscription_token
      : undefined;

    return (
      <Container id="e2e-user-edit-profile-page">
        {initialUnsubscribeStatus && (
          <InitialUnsubscribeFeedback status={initialUnsubscribeStatus} />
        )}
        {!isNilOrError(consents) && (
          <ConsentForm
            consents={consents}
            trackEventName="Unsubcribed from unsubscribe link flow"
            token={token}
          />
        )}
      </Container>
    );
  }
}

const EmailSettingPageWithHoc = withRouter(EmailSettingPage);

const Data = adopt<DataProps, WithRouterProps>({
  consents: ({ location, render }) => (
    <GetCampaignConsentsWithToken
      token={typeof location.query.unsubscription_token === 'string' ? location.query.unsubscription_token : null}
    >
      {render}
    </GetCampaignConsentsWithToken>
  )
});

export default (inputProps: WithRouterProps) => (
  <Data {...inputProps}>
    {dataprops => <EmailSettingPageWithHoc {...inputProps} {...dataprops} />}
  </Data>
);
