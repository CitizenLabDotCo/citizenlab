import * as React from 'react';
import styled from 'styled-components';
import { sendCampaign, sendCampaignPreview, ICampaignData, deleteCampaign } from 'services/campaigns';
import clHistory from 'utils/cl-router/history';

import GoBackButton from 'components/UI/GoBackButton';

import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../messages';
import { withRouter, WithRouterProps } from 'react-router';
import GetCampaign from 'resources/GetCampaign';
import { isNilOrError } from 'utils/helperUtils';
import T from 'components/T';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import { InjectedIntlProps } from 'react-intl';
import StatusLabel from 'components/UI/StatusLabel';
import DraftCampaignDetails from './DraftCampaignDetails';
import SentCampaignDetails from './SentCampaignDetails';

const PageTitle = styled.h1`
  width: 100%;
  font-size: 2rem;
  margin: 1rem 0 3rem 0;
`;

interface InputProps { }

interface DataProps {
  campaign: ICampaignData;
}

interface Props extends InputProps, DataProps, WithRouterProps, InjectedIntlProps { }

class Show extends React.Component<Props> {

  handleSendNow = () => {
    sendCampaign(this.props.campaign.id)
      .then(() => {
        streams.fetchAllStreamsWithEndpoint(`${API_PATH}/campaigns`);
        clHistory.push('/admin/campaigns');
      })
      .catch(() => {
      });
  }

  handleSendPreview = () => {
    sendCampaignPreview(this.props.campaign.id)
      .then(() => {
        const previewSentConfirmation = this.props.intl.formatMessage(messages.previewSentConfirmation);
        window.alert(previewSentConfirmation);
      });
  }

  handleSaveDraft = () => {
    clHistory.push('/admin/campaigns');
  }

  handleDelete = () => {
    const deleteMessage = this.props.intl.formatMessage(messages.campaignDeletionConfirmation);
    if (window.confirm(deleteMessage)) {
      deleteCampaign(this.props.campaign.id)
        .then(() => {
          clHistory.push('/admin/campaigns');
        });
    }
  }

  goBack = () => {
    clHistory.push('/admin/campaigns');
  }

  render() {
    const { campaign } = this.props;
    return (
      <div>
        <GoBackButton onClick={this.goBack} />
        <PageTitle>
          <T value={campaign.attributes.subject_multiloc} />
          {campaign.attributes.sent_at ?
            <StatusLabel color="success">
              <FormattedMessage {...messages.sent} />
            </StatusLabel>
          :
            <StatusLabel color={'draftYellow'}>
              <FormattedMessage {...messages.draft} />
            </StatusLabel>
          }
        </PageTitle>
        {campaign.attributes.sent_at ?
          <SentCampaignDetails campaignId={campaign.id} />
        :
          <DraftCampaignDetails campaignId={campaign.id} />
        }
      </div>
    );
  }
}

const ShowWithHOCs = withRouter(injectIntl(Show));

export default (inputProps: InputProps & WithRouterProps & InjectedIntlProps) => (
  <GetCampaign id={inputProps.params.campaignId}>
    {campaign => isNilOrError(campaign) ? null : <ShowWithHOCs {...inputProps} campaign={campaign} />}
  </GetCampaign>
);
