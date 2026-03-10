import * as React from 'react';
import { useState } from 'react';

import {
  StatusLabel,
  IconTooltip,
  colors,
  Title,
  Box,
  fontSizes,
  Button,
  Text,
  Dropdown,
} from '@citizenlab/cl2-component-library';
import moment from 'moment-timezone';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useCampaign from 'api/campaigns/useCampaign';
import useSendCampaign from 'api/campaigns/useSendCampaign';
import useSendCampaignPreview from 'api/campaigns/useSendCampaignPreview';
import useUpdateCampaign from 'api/campaigns/useUpdateCampaign';
import { isDraft } from 'api/campaigns/util';
import useUserById from 'api/users/useUserById';

import useLocalize from 'hooks/useLocalize';

import DateSinglePicker from 'components/admin/DatePickers/DateSinglePicker';
import DraftCampaignDetails from 'components/admin/Email/DraftCampaignDetails';
import SentCampaignDetails from 'components/admin/Email/SentCampaignDetails';
import Stamp from 'components/admin/Email/Stamp';
import { Form } from 'components/smallForm';
import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import Error from 'components/UI/Error';
import GoBackButton from 'components/UI/GoBackButton';
import Modal from 'components/UI/Modal';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import TimeInput from '../../events/components/DateTimeSelection/TimeInput';
import messages from '../messages';

import { getDefaultTime } from './utils';

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

const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  & > * {
    padding: 0 10px;
  }
`;

const StyledForm = styled(Form)`
  max-width: none;
  padding: 0;
`;

const Show = () => {
  const { projectId, campaignId } = useParams() as {
    projectId: string;
    campaignId: string;
  };

  const { data: tenant } = useAppConfiguration();
  const { data: campaign } = useCampaign(campaignId);

  const {
    mutate: sendCampaign,
    isLoading: isSendingCampaign,
    error: apiSendErrors,
  } = useSendCampaign();
  const { mutate: sendCampaignPreview, isLoading: isSendingCampaignPreview } =
    useSendCampaignPreview();
  const { mutate: updateCampaign, isLoading: isUpdatingCampaign } =
    useUpdateCampaign();

  const { data: sender } = useUserById(
    campaign?.data.relationships.author.data.id
  );
  const isLoading =
    isSendingCampaign || isSendingCampaignPreview || isUpdatingCampaign;

  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const handleSend = () => {
    // if the campaign is scheduled, we need to cancel the schedule ( send null ) before sending the campaign
    if (campaign?.data.attributes.scheduled_at) {
      updateCampaign({
        id: campaignId,
        campaign: { enabled: true, scheduled_at: null },
      });
    }
    sendCampaign(campaignId);
  };

  const handleSendTestEmail = () => {
    sendCampaignPreview(campaignId, {
      onSuccess: () => {
        const previewSentConfirmation = formatMessage(
          messages.previewSentConfirmation
        );
        window.alert(previewSentConfirmation);
      },
    });
  };

  const getSenderName = (senderType: string) => {
    let senderName: string | null = null;

    if (senderType === 'author' && sender) {
      senderName = getFullName(sender.data);
    } else if (senderType === 'organization' && tenant) {
      senderName = localize(
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        tenant?.data.attributes.settings.core.organization_name
      );
    }

    return senderName;
  };

  const timeZone = tenant?.data.attributes.settings.core.timezone;
  const tenantTimeNow = timeZone ? moment().tz(timeZone).toDate() : new Date();
  const gmtOffset = timeZone ? moment().tz(timeZone).format('Z') : '';
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    undefined
  );
  const [selectedTime, setSelectedTime] = React.useState<Date>(
    getDefaultTime()
  );
  const [openScheduleModal, setOpenScheduleModal] = useState(false);
  const [openCancelScheduleModal, setOpenCancelScheduleModal] = useState(false);
  const [openedDropdown, setOpenedDropdown] = useState(false);

  const handleScheduleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (campaign && selectedDate && timeZone) {
      const scheduledDateTime = new Date(selectedDate);
      scheduledDateTime.setHours(selectedTime.getHours());
      scheduledDateTime.setMinutes(selectedTime.getMinutes());
      scheduledDateTime.setSeconds(0);
      // store time in the tenant's timezone
      const scheduledAt = moment
        .tz(scheduledDateTime, timeZone)
        .utc()
        .toISOString();

      updateCampaign(
        {
          id: campaign.data.id,
          campaign: { enabled: true, scheduled_at: scheduledAt },
        },
        {
          onSuccess: () => {
            closeScheduleModal();
          },
        }
      );
    }
  };
  // cancel schedule campaign ( send scheduledAt as null )
  const handleCancelSchedule = () => {
    if (campaign) {
      updateCampaign(
        {
          id: campaign.data.id,
          campaign: { enabled: true, scheduled_at: null },
        },
        {
          onSuccess: () => {
            closeCancelScheduleModal();
          },
        }
      );
    }
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    // if the selected date is today, set the default time to the next hour in tenant timezone
    const todayInTenantTz = new Date(tenantTimeNow);
    todayInTenantTz.setHours(0, 0, 0, 0);
    const selectedInTenantTz = new Date(date);
    selectedInTenantTz.setHours(0, 0, 0, 0);

    if (selectedInTenantTz.getTime() === todayInTenantTz.getTime()) {
      const nextHour = tenantTimeNow.getHours() + 1;
      const newTime = new Date();
      newTime.setHours(nextHour, 0, 0, 0);
      setSelectedTime(newTime);
    }
  };

  const handleTimeChange = (time: Date) => {
    setSelectedTime(time);
  };
  const handleOpenScheduleModal = () => {
    // if email is already scheduled set the default value to scheduled date and time
    if (campaign?.data.attributes.scheduled_at && timeZone) {
      const scheduledDate = moment(campaign.data.attributes.scheduled_at)
        .tz(timeZone)
        .toDate();
      setSelectedDate(scheduledDate);
      setSelectedTime(scheduledDate);
    }
    setOpenScheduleModal(true);
  };
  const closeScheduleModal = () => {
    // reset selected date and time when closing the modal
    setSelectedDate(undefined);
    setSelectedTime(getDefaultTime());
    setOpenScheduleModal(false);
  };
  const handleCancelScheduleModal = () => {
    setOpenCancelScheduleModal(true);
  };
  const closeCancelScheduleModal = () => {
    setOpenCancelScheduleModal(false);
  };
  const toggleScheduleSendDropdown = () => {
    setOpenedDropdown(!openedDropdown);
  };

  if (campaign) {
    const senderType = campaign.data.attributes.sender;
    const senderName = getSenderName(senderType);

    return (
      <Box p="44px">
        <Box background={colors.white} p="40px" id="e2e-custom-email-container">
          <GoBackButton linkTo={`/admin/projects/${projectId}/messaging`} />
          <Box display="flex" mb="20px">
            <Box display="flex" alignItems="center" mr="auto" gap="12px">
              <Title mr="12px">
                <T value={campaign.data.attributes.subject_multiloc} />
              </Title>
              {isDraft(campaign.data) && (
                <StatusLabel
                  backgroundColor={colors.brown}
                  text={<FormattedMessage {...messages.draft} />}
                />
              )}
              {!isDraft(campaign.data) &&
                !campaign.data.attributes.scheduled_at && (
                  <StatusLabel
                    backgroundColor={colors.success}
                    text={<FormattedMessage {...messages.sent} />}
                  />
                )}
              {campaign.data.attributes.scheduled_at && timeZone && (
                <>
                  <StatusLabel
                    backgroundColor={colors.teal500}
                    text={<FormattedMessage {...messages.scheduled} />}
                  />
                  <Text fontSize="base">
                    {moment(campaign.data.attributes.scheduled_at)
                      .tz(timeZone)
                      .format('MMM DD, YYYY hh:mm A')}
                  </Text>
                </>
              )}
            </Box>
            {(isDraft(campaign.data) ||
              campaign.data.attributes.scheduled_at) && (
              <Buttons>
                <ButtonWithLink
                  linkTo={`/admin/projects/${projectId}/messaging/${campaign.data.id}/edit`}
                  buttonStyle="secondary-outlined"
                >
                  <FormattedMessage {...messages.editButtonLabel} />
                </ButtonWithLink>

                <Box
                  position="relative"
                  display="flex"
                  gap="0.3px"
                  alignItems="center"
                >
                  <Button
                    buttonStyle="admin-dark"
                    icon="send"
                    iconPos="right"
                    onClick={handleSend}
                    disabled={isLoading}
                    processing={isSendingCampaign}
                    borderRadius="3px 0px 0px 3px"
                    height="75%"
                  >
                    <FormattedMessage {...messages.send} />
                  </Button>
                  <Button
                    buttonStyle="admin-dark"
                    icon="chevron-down"
                    onClick={toggleScheduleSendDropdown}
                    disabled={isLoading}
                    borderRadius="0px 3px 3px 0px"
                    padding="0px 8px"
                    height="75%"
                  />

                  <Dropdown
                    opened={openedDropdown}
                    onClickOutside={() => setOpenedDropdown(false)}
                    width="200px"
                    top="65px"
                    right="0px"
                    content={
                      <Box background={colors.white}>
                        {isDraft(campaign.data) && (
                          <Button
                            onClick={() => {
                              handleOpenScheduleModal();
                              setOpenedDropdown(false);
                            }}
                            buttonStyle="text"
                            justify="left"
                            bgHoverColor={colors.background}
                          >
                            <FormattedMessage {...messages.scheduleSend} />
                          </Button>
                        )}
                        {campaign.data.attributes.scheduled_at && (
                          <>
                            <Button
                              onClick={handleOpenScheduleModal}
                              buttonStyle="text"
                              justify="left"
                              bgHoverColor={colors.background}
                            >
                              <FormattedMessage {...messages.rescheduleSend} />
                            </Button>
                            <Button
                              onClick={handleCancelScheduleModal}
                              buttonStyle="text"
                              justify="left"
                              bgHoverColor={colors.background}
                            >
                              <FormattedMessage {...messages.cancelSchedule} />
                            </Button>
                          </>
                        )}
                      </Box>
                    }
                  />
                </Box>
              </Buttons>
            )}
          </Box>
          {apiSendErrors && (
            <Box mb="8px">
              <Error apiErrors={apiSendErrors.errors['base']} />
            </Box>
          )}
          <Box
            display="flex"
            p="20px 0"
            borderTop={`1px solid ${colors.borderLight}`}
            borderBottom={`1px solid ${colors.borderLight}`}
            marginBottom="20px"
          >
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
                <span>
                  <FormattedMessage {...messages.projectParticipants} />
                </span>
              </div>
            </FromTo>
            {isDraft(campaign.data) && (
              <Box mb="30px" display="flex" alignItems="center">
                <SendTestEmailButton onClick={handleSendTestEmail}>
                  <FormattedMessage {...messages.sendTestEmailButton} />
                </SendTestEmailButton>
                &nbsp;
                <IconTooltip
                  content={
                    <FormattedMessage {...messages.sendTestEmailTooltip} />
                  }
                />
              </Box>
            )}
          </Box>

          {isDraft(campaign.data) || campaign.data.attributes.scheduled_at ? (
            <DraftCampaignDetails campaign={campaign.data} />
          ) : (
            <SentCampaignDetails campaignId={campaign.data.id} />
          )}
        </Box>
        <Modal
          opened={openScheduleModal}
          close={closeScheduleModal}
          niceHeader
          header={
            <Title px="12px">
              <FormattedMessage {...messages.scheduleSendTitle} />
            </Title>
          }
        >
          <Box mb="16px" p="24px">
            <Text>
              <FormattedMessage {...messages.scheduleSendDescription} />
            </Text>
            <Box>
              <StyledForm onSubmit={handleScheduleFormSubmit}>
                <Box display="flex" gap="16px" alignItems="center">
                  <DateSinglePicker
                    onChange={handleDateChange}
                    selectedDate={selectedDate}
                    startMonth={new Date()}
                    placement="right"
                    disabledPast={{ before: new Date() }}
                  />
                  <TimeInput
                    selectedTime={selectedTime}
                    onChange={handleTimeChange}
                    selectedDate={selectedDate}
                    currentTimeInTz={tenantTimeNow}
                  />
                  <Text fontSize="l">GMT{gmtOffset}</Text>
                </Box>
                <Warning mt="24px">
                  <Text mt="12px" fontSize="m">
                    <FormattedMessage {...messages.scheduleSendWarning} />
                  </Text>
                </Warning>
                <Button
                  type="submit"
                  mt="24px"
                  disabled={!selectedDate || !selectedTime}
                >
                  <FormattedMessage {...messages.confirmSchedule} />
                </Button>
              </StyledForm>
            </Box>
          </Box>
        </Modal>

        <Modal
          opened={openCancelScheduleModal}
          close={closeCancelScheduleModal}
          niceHeader
          header={
            <Title px="12px">
              <FormattedMessage {...messages.cancelScheduleTitle} />{' '}
            </Title>
          }
        >
          <Box mb="16px" p="24px">
            <Text mb="16px">
              <FormattedMessage {...messages.cancelScheduleDescription} />
            </Text>
            <Box display="flex" gap="16px" justifyContent="flex-end">
              <Button onClick={handleCancelSchedule} buttonStyle="admin-dark">
                <FormattedMessage {...messages.confirmCancelSchedule} />
              </Button>
              <Button
                onClick={closeCancelScheduleModal}
                buttonStyle="secondary"
              >
                <FormattedMessage {...messages.keepSchedule} />
              </Button>
            </Box>
          </Box>
        </Modal>
      </Box>
    );
  }

  return null;
};

export default Show;
