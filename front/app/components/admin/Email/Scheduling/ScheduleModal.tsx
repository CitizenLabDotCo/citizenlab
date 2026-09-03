import * as React from 'react';
import { useState, useEffect } from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import { isSameDay } from 'date-fns';
import styled from 'styled-components';

import {
  IEmailCampaign,
  EmailCampaignFormValues,
} from 'api/campaigns/email/types';
import useUpdateEmailCampaign from 'api/campaigns/email/useUpdateEmailCampaign';

import DateSinglePicker from 'components/admin/DatePickers/DateSinglePicker';
import TimeInput from 'components/admin/TimeSelection/TimeInput';
import { Form } from 'components/smallForm';
import Modal from 'components/UI/Modal';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { getViewerZone } from 'utils/dateFormat';
import {
  convertToTimeZoneISO,
  getDateInTimezone,
  getGmtOffset,
  nowInZone,
} from 'utils/dateUtils';

import messages from './messages';
import { getDefaultTime, getNextHourTime } from './utils';

const StyledForm = styled(Form)`
  max-width: none;
  padding: 0;
`;

interface Props {
  campaign: IEmailCampaign;
  timeZone: string | undefined;
  opened: boolean;
  onClose: () => void;
}

const ScheduleModal = ({ opened, campaign, timeZone, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: updateCampaign, isPending: isUpdatingCampaign } =
    useUpdateEmailCampaign();

  const tenantTimeNow = nowInZone(timeZone);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<Date>(getDefaultTime());

  const gmtOffset = getGmtOffset(timeZone, tenantTimeNow, selectedDate);
  const browserTimezone = getViewerZone();
  const browserOffset = getGmtOffset(
    browserTimezone,
    tenantTimeNow,
    selectedDate
  );
  const showGmtOffset = !!timeZone && gmtOffset !== browserOffset;

  // if email is already scheduled set the default value to scheduled date and time
  useEffect(() => {
    if (opened && campaign.data.attributes.scheduled_at && timeZone) {
      // Deliberately not the raw instant: the pickers work in local Dates
      // whose components must read as the tenant's wall clock.
      const scheduledDate = getDateInTimezone(
        campaign.data.attributes.scheduled_at,
        timeZone
      );
      if (scheduledDate) {
        setSelectedDate(scheduledDate);
        setSelectedTime(scheduledDate);
      }
    }
  }, [opened, campaign.data.attributes.scheduled_at, timeZone]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);

    // if the selected date is today, check if selected time is in the past
    if (isSameDay(date, tenantTimeNow)) {
      const selectedDateTime = new Date(date);
      selectedDateTime.setHours(selectedTime.getHours());
      selectedDateTime.setMinutes(selectedTime.getMinutes());
      selectedDateTime.setSeconds(0);
      if (selectedDateTime <= tenantTimeNow) {
        setSelectedTime(getNextHourTime(tenantTimeNow));
      }
    }
  };

  const handleTimeChange = (time: Date) => {
    setSelectedTime(time);
  };

  const handleScheduleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDate || !timeZone) return;

    const scheduledDateTime = new Date(selectedDate);
    scheduledDateTime.setHours(selectedTime.getHours());
    scheduledDateTime.setMinutes(selectedTime.getMinutes());
    scheduledDateTime.setSeconds(0);
    const scheduledAt = convertToTimeZoneISO(scheduledDateTime, timeZone);

    updateCampaign(
      {
        id: campaign.data.id,
        campaign: { scheduled_at: scheduledAt } as EmailCampaignFormValues,
      },
      {
        onSuccess: handleClose,
      }
    );
  };

  const handleClose = () => {
    // Reset selected date and time when closing the modal
    setSelectedDate(undefined);
    setSelectedTime(getDefaultTime());
    onClose();
  };

  return (
    <Modal
      opened={opened}
      close={handleClose}
      header={formatMessage(messages.scheduleSendTitle)}
    >
      <Box p="32px">
        <Text mt="0">
          <FormattedMessage {...messages.scheduleSendDescription} />
        </Text>
        <Box>
          <StyledForm onSubmit={handleScheduleFormSubmit}>
            <Box display="flex" gap="16px" alignItems="center" mb="12px">
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
              {showGmtOffset && <Text fontSize="l">GMT{gmtOffset}</Text>}
            </Box>
            <Warning mb="12px">
              <Text fontSize="m" m="0px">
                <FormattedMessage {...messages.scheduleSendWarning} />
              </Text>
            </Warning>
            <Button
              type="submit"
              disabled={!selectedDate || isUpdatingCampaign}
            >
              <FormattedMessage {...messages.confirmSchedule} />
            </Button>
          </StyledForm>
        </Box>
      </Box>
    </Modal>
  );
};

export default ScheduleModal;
