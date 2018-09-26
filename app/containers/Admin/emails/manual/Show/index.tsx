import * as React from 'react';
import styled from 'styled-components';
import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'react-router';
import { API_PATH } from 'containers/App/constants';

// services & resources
import streams from 'utils/streams';
import { sendCampaign, sendCampaignPreview, ICampaignData, deleteCampaign, isDraft } from 'services/campaigns';
import GetCampaign from 'resources/GetCampaign';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../../messages';

// components
import Button from 'components/UI/Button';
import StatusLabel from 'components/UI/StatusLabel';
import DraftCampaignDetails from './DraftCampaignDetails';
import SentCampaignDetails from './SentCampaignDetails';
import T from 'components/T';
import GoBackButton from 'components/UI/GoBackButton';

// utils
import { isNilOrError } from 'utils/helperUtils';

const PageHeader = styled.div`
  display: flex;
`;

const PageTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 3rem 0 4rem;
  margin-right: auto;
`;

const PageTitle = styled.h1`
  margin-bottom: 0;
  margin-right: 1rem;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 20px 0;
  & > * {
    padding: 0 10px;
  }
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
        clHistory.push('/admin/emails/manual');
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
    clHistory.push('/admin/emails/manual');
  }

  handleDelete = () => {
    const deleteMessage = this.props.intl.formatMessage(messages.campaignDeletionConfirmation);
    if (window.confirm(deleteMessage)) {
      deleteCampaign(this.props.campaign.id)
        .then(() => {
          clHistory.push('/admin/emails/manual');
        });
    }
  }

  goBack = () => {
    clHistory.push('/admin/emails/manual');
  }

  render() {
    const { campaign } = this.props;
    return (
      <div>
        <GoBackButton onClick={this.goBack} />
        <PageHeader>
          <PageTitleWrapper>
            <PageTitle>
              <T value={campaign.attributes.subject_multiloc} />
            </PageTitle>
            {isDraft(campaign) ?
              <StatusLabel color="draftYellow" text={<FormattedMessage {...messages.draft} />} />
            :
              <StatusLabel color="clGreenSuccess" text={<FormattedMessage {...messages.sent} />} />
            }
          </PageTitleWrapper>
          {isDraft(campaign) &&
            <Buttons>
              <Button linkTo={`/admin/emails/manual/${campaign.id}/edit`} style="secondary" icon="edit">
                <FormattedMessage {...messages.editButtonLabel} />
              </Button>

              <Button
                style="primary-outlined"
                onClick={this.handleSendPreview}
              >
                <FormattedMessage {...messages.sendPreviewButton} />
              </Button>

              <Button
                style="primary"
                icon="send"
                onClick={this.handleSendNow}
              >
                <FormattedMessage {...messages.sendNowButton} />
              </Button>
            </Buttons>
          }

        </PageHeader>
        {isDraft(campaign) ?
          <DraftCampaignDetails campaignId={campaign.id} />
        :
          <SentCampaignDetails campaignId={campaign.id} />
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
