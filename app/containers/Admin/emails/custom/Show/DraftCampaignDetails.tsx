import * as React from 'react';
import { ICampaignData, deleteCampaign } from 'services/campaigns';
import clHistory from 'utils/cl-router/history';

import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../../messages';
import GetCampaign from 'resources/GetCampaign';
import { isNilOrError } from 'utils/helperUtils';
import Button from 'components/UI/Button';
import { InjectedIntlProps } from 'react-intl';
import PreviewFrame from './PreviewFrame';
import styled from 'styled-components';

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

interface Props extends InputProps, DataProps, InjectedIntlProps {}

class DraftCampaignDetails extends React.Component<Props> {
  handleDelete = () => {
    const deleteMessage = this.props.intl.formatMessage(
      messages.campaignDeletionConfirmation
    );
    if (window.confirm(deleteMessage)) {
      deleteCampaign(this.props.campaign.id).then(() => {
        clHistory.push('/admin/emails/custom');
      });
    }
  };

  render() {
    const { campaign } = this.props;
    return (
      <>
        <PreviewFrame campaignId={campaign.id} />
        <ButtonWrapper>
          <Button buttonStyle="delete" icon="trash" onClick={this.handleDelete}>
            <FormattedMessage {...messages.deleteCampaignButton} />
          </Button>
        </ButtonWrapper>
      </>
    );
  }
}

const DraftCampaignDetailsWithHOCs = injectIntl<InputProps & DataProps>(
  DraftCampaignDetails
);

export default (inputProps: InputProps) => (
  <GetCampaign id={inputProps.campaignId}>
    {(campaign) =>
      isNilOrError(campaign) ? null : (
        <DraftCampaignDetailsWithHOCs {...inputProps} campaign={campaign} />
      )
    }
  </GetCampaign>
);
