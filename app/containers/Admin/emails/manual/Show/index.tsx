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
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

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
import { fontSizes } from 'utils/styleUtils';

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
  user: GetAuthUserChildProps;
  tenant: GetTenantChildProps;
}

interface Props extends InputProps, DataProps, WithRouterProps, InjectedIntlProps, InjectedLocalized { }

interface State {}

class Show extends React.Component<Props, State> {

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

  getSenderName = (senderType: string) => {
    const { user, tenant, localize } = this.props;
    let senderName: string | null = null;

    if (senderType === 'author' && !isNilOrError(user)) {
      senderName = `${user.attributes.first_name} ${user.attributes.last_name}`;
    } else if (senderType === 'organization' && !isNilOrError(tenant)) {
      senderName = localize(tenant.attributes.settings.core.organization_name);
    }

    return senderName;
  }

  render() {
    const { campaign } = this.props;

    if (campaign) {
      const groupIds = campaign.relationships.groups.data.map(group => group.id);
      const senderType = campaign.attributes.sender;
      const senderName = this.getSenderName(senderType);

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
                <span>{senderName}</span>
              </div>
              <div>
                <span>
                  <FormattedMessage {...messages.campaignTo}/>
                </span>
                {groupIds.map((groupId, index) => (
                  <GetGroup key={groupId} id={groupId}>
                    {group => {
                      if (index < groupIds.length - 1) {
                        return <span>{!isNilOrError(group) && this.props.localize(group.attributes.title_multiloc)}, </span>;
                      }
                      return <span>{!isNilOrError(group) && this.props.localize(group.attributes.title_multiloc)}</span>;
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

    return null;
  }
}

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  campaign: ({ params, render }) => <GetCampaign id={params.campaignId}>{render}</GetCampaign>,
  user: ({ render }) => <GetAuthUser>{render}</GetAuthUser>,
  tenant: ({ render }) => <GetTenant>{render}</GetTenant>
});

const ShowWithHOCs = injectIntl(localize(Show));

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <ShowWithHOCs {...inputProps} {...dataProps} />}
  </Data>
));
