import * as React from 'react';
import styled from 'styled-components';
import { sendCampaign, sendCampaignPreview, ICampaignData, deleteCampaign } from 'services/campaigns';
import clHistory from 'utils/cl-router/history';

import GoBackButton from 'components/UI/GoBackButton';
import PageWrapper from 'components/admin/PageWrapper';

import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../messages';
import { withRouter, WithRouterProps } from 'react-router';
import GetCampaign from 'resources/GetCampaign';
import { isNilOrError } from 'utils/helperUtils';
import T from 'components/T';
import Button from 'components/UI/Button';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import { InjectedIntlProps } from 'react-intl';
import StatusLabel from 'components/UI/StatusLabel';
import PreviewFrame from './PreviewFrame';

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
          <StatusLabel color={'draftYellow'}>
            <FormattedMessage {...messages.draft} />
          </StatusLabel>
        </PageTitle>
        <PageWrapper>
          <div>
            <Button linkTo={`/admin/campaigns/${campaign.id}/edit`} style="secondary" circularCorners={false} icon="edit">
              <FormattedMessage {...messages.editButtonLabel} />
            </Button>
            <PreviewFrame campaignId={campaign.id} />
          </div>
          <div>
            <Button
              style="primary"
              size="4"
              icon="send"
              onClick={this.handleSendNow}
            >
              <FormattedMessage {...messages.sendNowButton} />
            </Button>
          </div>

          <div>
            <Button
              style="primary-outlined"
              onClick={this.handleSendPreview}
            >
              <FormattedMessage {...messages.sendPreviewButton} />
            </Button>
          </div>

          <div>
            <Button onClick={this.handleDelete} style="text" circularCorners={false} icon="delete">
              <FormattedMessage {...messages.deleteButtonLabel} />
            </Button>
          </div>

        </PageWrapper>
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
