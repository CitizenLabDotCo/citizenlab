import * as React from 'react';
import styled from 'styled-components';
import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'react-router';
import { API_PATH } from 'containers/App/constants';
import { adopt } from 'react-adopt';

// services & resources
import streams from 'utils/streams';
import { sendCampaign, sendCampaignPreview, ICampaignData, deleteCampaign, isDraft } from 'services/campaigns';
import GetCampaign from 'resources/GetCampaign';
import GetGroup from 'resources/GetGroup';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../../messages';
import localize, { InjectedLocalized } from 'utils/localize';

// components
import Button from 'components/UI/Button';
import StatusLabel from 'components/UI/StatusLabel';
import DraftCampaignDetails from './DraftCampaignDetails';
import SentCampaignDetails from './SentCampaignDetails';
import T from 'components/T';
import Icon from 'components/UI/Icon';

// utils
import { isNilOrError } from 'utils/helperUtils';

// styling
import { fontSizes, colors } from 'utils/styleUtils';

const Instructions = styled.div`
  max-width: 600px;
  margin-bottom: 30px;
`;

const InstructionsHeader = styled.h2`
  font-weight: 400;
`;

const InstructionsText = styled.p`
  font-size: ${fontSizes.base}px;
  color: #616D76;
`;

const PageHeader = styled.div`
  display: flex;
`;

const CampaignHeader = styled.div`
  display: flex;
  padding: 20px 0;
  border-top: 1px solid #d8d8d8;
  border-bottom: 1px solid #d8d8d8;
  margin-bottom: 20px;
`;

const StampIcon = styled(Icon)`
  margin-right: 20px;
`;

const FromTo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const SendPreviewButton = styled.button`
  margin-bottom: 30px;
  text-decoration: underline;
  font-size: ${fontSizes.base}px;
  font-weight: bold;
  cursor: pointer;
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

interface Props extends InputProps, DataProps, WithRouterProps, InjectedIntlProps, InjectedLocalized { }

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

  render() {
    const { campaign } = this.props;
    const groupIds = campaign.relationships.groups.data.map(group => group.id);
    return (
      <div>
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
              <Button linkTo={`/admin/emails/manual/${campaign.id}/edit`} style="secondary">
                <FormattedMessage {...messages.editButtonLabel} />
              </Button>
              <Button
                style="admin-dark"
                icon="send"
                iconPos="right"
                onClick={this.handleSendNow}
              >
                <FormattedMessage {...messages.sendNowButton} />
              </Button>
            </Buttons>
          }
        </PageHeader>
        <Instructions>
          <InstructionsHeader>
            <FormattedMessage {...messages.instructionsHeader} />
          </InstructionsHeader>
          <InstructionsText>
            <FormattedMessage {...messages.instructionsText} />
          </InstructionsText>
        </Instructions>
        <CampaignHeader>
          <StampIcon name="stamp" />
          <FromTo>
            <div>
              <span>
                <FormattedMessage {...messages.campaignFrom}/>
              </span>
              <span>{}</span>
            </div>
            <div>
              <span>
                <FormattedMessage {...messages.campaignTo}/>
              </span>
              {groupIds.forEach((groupId, index) => (
                <GetGroup id={groupId}>
                  {group => {
                    console.log(group);
                    if (index < groupIds.length - 1) {
                      return <span>{this.props.localize(group.attributes.title_multiloc)},</span>;
                    }
                    return <span>{this.props.localize(group.attributes.title_multiloc)}</span>;
                  }}
                </GetGroup>
              ))}
            </div>
          </FromTo>
        </CampaignHeader>

        <SendPreviewButton
          onClick={this.handleSendPreview}
        >
          <FormattedMessage {...messages.sendPreviewButton} />
        </SendPreviewButton>

        {isDraft(campaign) ?
          <DraftCampaignDetails campaignId={campaign.id} />
        :
          <SentCampaignDetails campaignId={campaign.id} />
        }
      </div>
    );
  }
}

const ShowWithHOCs = withRouter(injectIntl(localize(Show));

export default (inputProps: InputProps & WithRouterProps & InjectedIntlProps) => (
  <GetCampaign id={inputProps.params.campaignId}>
    {campaign => isNilOrError(campaign) ? null : <ShowWithHOCs {...inputProps} campaign={campaign} />}
  </GetCampaign>
);
