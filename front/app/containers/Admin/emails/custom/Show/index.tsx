import * as React from 'react';
import styled from 'styled-components';
import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'react-router';
import { adopt } from 'react-adopt';

// services & resources
import {
  sendCampaign,
  sendCampaignPreview,
  ICampaignData,
  isDraft,
} from 'services/campaigns';
import GetCampaign from 'resources/GetCampaign';
import GetGroup from 'resources/GetGroup';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../../messages';
import localize, { InjectedLocalized } from 'utils/localize';

// components
import Button from 'components/UI/Button';
import { StatusLabel, IconTooltip } from 'cl2-component-library';
import DraftCampaignDetails from './DraftCampaignDetails';
import SentCampaignDetails from './SentCampaignDetails';
import T from 'components/T';
import Modal from 'components/UI/Modal';
import Stamp from './Stamp';

// utils
import { isNilOrError } from 'utils/helperUtils';

// styling
import { fontSizes } from 'utils/styleUtils';

const Container = styled.div``;

const PageHeader = styled.div`
  display: flex;
  margin-bottom: 20px;
`;

const CampaignHeader = styled.div`
  display: flex;
  padding: 20px 0;
  border-top: 1px solid #d8d8d8;
  border-bottom: 1px solid #d8d8d8;
  margin-bottom: 20px;
`;

const StampIcon = styled(Stamp)`
  margin-right: 20px;
`;

const FromTo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: ${fontSizes.base}px;
  margin-right: auto;
`;

const FromToHeader = styled.span`
  font-weight: bold;
`;

const SendTestEmailButton = styled.button`
  text-decoration: underline;
  font-size: ${fontSizes.base}px;
  cursor: pointer;
`;
const StyledButtonContainer = styled.div`
  margin-bottom: 30px;
  display: flex;
  align-items: center;
`;

const PageTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: auto;
`;

const PageTitle = styled.h1`
  margin-bottom: 0;
  margin-right: 1rem;
  font-weight: 600;
`;

const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  & > * {
    padding: 0 10px;
  }
`;

const GroupLink = styled.a`
  color: inherit;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ButtonsWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
  width: 100%;

  .Button {
    margin-right: 1rem;
    margin-bottom: 0.5rem;
  }
`;

const ModalContainer = styled.div`
  padding: 30px;
`;

const SendNowWarning = styled.div`
  font-size: ${fontSizes.base}px;
  margin-bottom: 30px;
`;

interface InputProps {}

interface DataProps {
  campaign: ICampaignData;
  user: GetAuthUserChildProps;
  tenant: GetAppConfigurationChildProps;
}

interface Props
  extends InputProps,
    DataProps,
    WithRouterProps,
    InjectedIntlProps,
    InjectedLocalized {}

interface State {
  showSendConfirmationModal: boolean;
}

class Show extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      showSendConfirmationModal: false,
    };
  }

  handleSend = (noGroupsSelected: boolean) => () => {
    if (noGroupsSelected) {
      this.openSendConfirmationModal();
    } else {
      sendCampaign(this.props.campaign.id);
    }
  };

  handleSendTestEmail = () => {
    sendCampaignPreview(this.props.campaign.id).then(() => {
      const previewSentConfirmation = this.props.intl.formatMessage(
        messages.previewSentConfirmation
      );
      window.alert(previewSentConfirmation);
    });
  };

  handleGroupLinkClick = (groupId?: string) => (
    event: React.FormEvent<any>
  ) => {
    event.preventDefault();
    if (groupId) {
      clHistory.push(`/admin/users/${groupId}`);
    } else {
      clHistory.push('/admin/users');
    }
  };

  getSenderName = (senderType: string) => {
    const { user, tenant, localize } = this.props;
    let senderName: string | null = null;

    if (senderType === 'author' && !isNilOrError(user)) {
      senderName = `${user.attributes.first_name} ${user.attributes.last_name}`;
    } else if (senderType === 'organization' && !isNilOrError(tenant)) {
      senderName = localize(tenant.attributes.settings.core.organization_name);
    }

    return senderName;
  };

  openSendConfirmationModal = () => {
    this.setState({ showSendConfirmationModal: true });
  };

  closeSendConfirmationModal = () => {
    this.setState({ showSendConfirmationModal: false });
  };

  confirmSendCampaign = (campaignId: string) => () => {
    sendCampaign(campaignId).then(() => {
      this.closeSendConfirmationModal();
    });
  };

  render() {
    const { campaign } = this.props;
    const { showSendConfirmationModal } = this.state;

    if (campaign) {
      const groupIds: string[] = campaign.relationships.groups.data.map(
        (group) => group.id
      );
      const senderType = campaign.attributes.sender;
      const senderName = this.getSenderName(senderType);
      const noGroupsSelected = groupIds.length === 0;

      return (
        <Container id="e2e-custom-email-container">
          <PageHeader>
            <PageTitleWrapper>
              <PageTitle>
                <T value={campaign.attributes.subject_multiloc} />
              </PageTitle>
              {isDraft(campaign) ? (
                <StatusLabel
                  backgroundColor="draftYellow"
                  text={<FormattedMessage {...messages.draft} />}
                />
              ) : (
                <StatusLabel
                  backgroundColor="clGreenSuccess"
                  text={<FormattedMessage {...messages.sent} />}
                />
              )}
            </PageTitleWrapper>
            {isDraft(campaign) && (
              <Buttons>
                <Button
                  linkTo={`/admin/emails/custom/${campaign.id}/edit`}
                  buttonStyle="secondary"
                >
                  <FormattedMessage {...messages.editButtonLabel} />
                </Button>
                <Button
                  buttonStyle="admin-dark"
                  icon="send"
                  iconPos="right"
                  onClick={this.handleSend(noGroupsSelected)}
                >
                  <FormattedMessage {...messages.send} />
                </Button>
              </Buttons>
            )}
          </PageHeader>
          <CampaignHeader>
            <StampIcon />
            <FromTo>
              <div>
                <FromToHeader>
                  <FormattedMessage {...messages.campaignFrom} />
                  &nbsp;
                </FromToHeader>
                <span>{senderName}</span>
              </div>
              <div>
                <FromToHeader>
                  <FormattedMessage {...messages.campaignTo} />
                  &nbsp;
                </FromToHeader>
                {noGroupsSelected && (
                  <GroupLink onClick={this.handleGroupLinkClick()}>
                    {this.props.intl.formatMessage(messages.allUsers)}
                  </GroupLink>
                )}
                {groupIds.map((groupId, index) => (
                  <GetGroup key={groupId} id={groupId}>
                    {(group) => {
                      if (index < groupIds.length - 1) {
                        return (
                          <GroupLink
                            onClick={this.handleGroupLinkClick(groupId)}
                          >
                            {!isNilOrError(group) &&
                              this.props.localize(
                                group.attributes.title_multiloc
                              )}
                            ,{' '}
                          </GroupLink>
                        );
                      }
                      return (
                        <GroupLink onClick={this.handleGroupLinkClick(groupId)}>
                          {!isNilOrError(group) &&
                            this.props.localize(
                              group.attributes.title_multiloc
                            )}
                        </GroupLink>
                      );
                    }}
                  </GetGroup>
                ))}
              </div>
            </FromTo>
            {isDraft(campaign) && (
              <StyledButtonContainer>
                <SendTestEmailButton onClick={this.handleSendTestEmail}>
                  <FormattedMessage {...messages.sendTestEmailButton} />
                </SendTestEmailButton>
                &nbsp;
                <IconTooltip
                  content={
                    <FormattedMessage {...messages.sendTestEmailTooltip} />
                  }
                />
              </StyledButtonContainer>
            )}
          </CampaignHeader>

          {isDraft(campaign) ? (
            <DraftCampaignDetails campaignId={campaign.id} />
          ) : (
            <SentCampaignDetails campaignId={campaign.id} />
          )}

          <Modal
            opened={showSendConfirmationModal}
            close={this.closeSendConfirmationModal}
            header={<FormattedMessage {...messages.confirmSendHeader} />}
          >
            <ModalContainer>
              <SendNowWarning>
                <FormattedMessage {...messages.toAllUsers} />
              </SendNowWarning>
              <ButtonsWrapper>
                <Button
                  buttonStyle="secondary"
                  linkTo={`/admin/emails/custom/${campaign.id}/edit`}
                >
                  <FormattedMessage {...messages.changeRecipientsButton} />
                </Button>
                <Button
                  buttonStyle="primary"
                  onClick={this.confirmSendCampaign(this.props.campaign.id)}
                  icon="send"
                  iconPos="right"
                >
                  <FormattedMessage {...messages.sendNowButton} />
                </Button>
              </ButtonsWrapper>
            </ModalContainer>
          </Modal>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  campaign: ({ params, render }) => (
    <GetCampaign id={params.campaignId}>{render}</GetCampaign>
  ),
  user: ({ render }) => <GetAuthUser>{render}</GetAuthUser>,
  tenant: ({ render }) => <GetAppConfiguration>{render}</GetAppConfiguration>,
});

const ShowWithHOCs = injectIntl(localize(Show));

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {(dataProps) => <ShowWithHOCs {...inputProps} {...dataProps} />}
  </Data>
));
