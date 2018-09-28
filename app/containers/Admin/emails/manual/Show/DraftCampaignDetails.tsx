import * as React from 'react';
import { sendCampaign, sendCampaignPreview, ICampaignData, deleteCampaign } from 'services/campaigns';
import clHistory from 'utils/cl-router/history';

import PageWrapper from 'components/admin/PageWrapper';

import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../../messages';
import GetCampaign from 'resources/GetCampaign';
import { isNilOrError } from 'utils/helperUtils';
import Button from 'components/UI/Button';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import { InjectedIntlProps } from 'react-intl';
import PreviewFrame from './PreviewFrame';
import styled from 'styled-components';
import { clColorTheme } from 'components/UI/Icon';

const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 20px 0;
  & > * {
    padding: 0 10px;
  }
`;

const ButtonWrapper = styled.div`
  margin: 40px 0;
  display: flex;
  justify-content: flex-end;
`;

interface InputProps {
  campaignId: string;
}

interface DataProps {
  campaign: ICampaignData;
}

interface Props extends InputProps, DataProps, InjectedIntlProps { }

class DraftCampaignDetails extends React.Component<Props> {

  handleSendNow = () => {
    sendCampaign(this.props.campaign.id)
      .then(() => {
        streams.fetchAllStreamsWithEndpoint(`${API_PATH}/campaigns`);
        streams.fetchAllStreamsWithEndpoint(`${API_PATH}/campaigns/${this.props.campaign.id}`);
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

  render() {
    const { campaign } = this.props;
    const iconColors: clColorTheme = {
      clIconPrimary: '#fff',
      clIconSecondary: '',
      clIconAccent: '#fff',
      clIconBackground: ''
    };
    return (
      <>
        <PreviewFrame campaignId={campaign.id} />
        <ButtonWrapper>
          <Button
            iconTheme={iconColors}
            style="delete"
            icon="trash"
            onClick={this.handleDelete}
          >
            <FormattedMessage {...messages.deleteCampaignButton} />
          </Button>
        </ButtonWrapper>
      </>
    );
  }
}

const DraftCampaignDetailsWithHOCs = injectIntl<InputProps & DataProps>(DraftCampaignDetails);

export default (inputProps: InputProps) => (
  <GetCampaign id={inputProps.campaignId}>
    {campaign => isNilOrError(campaign) ? null : <DraftCampaignDetailsWithHOCs {...inputProps} campaign={campaign} />}
  </GetCampaign>
);
