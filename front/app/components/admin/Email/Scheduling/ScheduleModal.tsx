import * as React from 'react';
import { useState, useEffect } from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import isSameDay from 'date-fns/isSameDay';
import moment from 'moment-timezone';
import styled from 'styled-components';

import { ICampaign, CampaignFormValues } from 'api/campaigns/types';
import useUpdateCampaign from 'api/campaigns/useUpdateCampaign';

import DateSinglePicker from 'components/admin/DatePickers/DateSinglePicker';
import { Form } from 'components/smallForm';
import Modal from 'components/UI/Modal';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import TimeInput from '../../../../containers/Admin/projects/project/events/components/DateTimeSelection/TimeInput';

import messages from './messages';
import { getDefaultTime, getNextHourTime } from './utils';

const StyledForm = styled(Form)`
  max-width: none;
  padding: 0;
`;

interface Props {
  campaign: ICampaign;
  timeZone: string | undefined;
  opened: boolean;
  onClose: () => void;
}

const ScheduleModal = ({ opened, campaign, timeZone, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: updateCampaign, isLoading: isUpdatingCampaign } =
    useUpdateCampaign();

  const tenantTimeNow = timeZone ? moment().tz(timeZone).toDate() : new Date();
  const gmtOffset = timeZone ? moment().tz(timeZone).format('Z') : '';
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<Date>(getDefaultTime());

  // if email is already scheduled set the default value to scheduled date and time
  useEffect(() => {
    if (opened && campaign.data.attributes.scheduled_at && timeZone) {
      const scheduledDate = moment(campaign.data.attributes.scheduled_at)
        .tz(timeZone)
        .toDate();
      setSelectedDate(scheduledDate);
      setSelectedTime(scheduledDate);
    }
  }, [opened, campaign.data.attributes.scheduled_at, timeZone]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);

    // if the selected date is today, set the default time to the next hour in tenant timezone
    if (isSameDay(date, tenantTimeNow)) {
      setSelectedTime(getNextHourTime(tenantTimeNow));
    }
  };

  const handleTimeChange = (time: Date) => {
    setSelectedTime(time);
  };

  const handleScheduleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDate || !timeZone) return;

    const combined = new Date(selectedDate);
    combined.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
    const scheduledAt = moment.tz(combined, timeZone).toISOString();
    updateCampaign(
      {
        id: campaign.data.id,
        campaign: { scheduled_at: scheduledAt } as CampaignFormValues,
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
      <Box p="30px">
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
              <Text fontSize="l">GMT{gmtOffset}</Text>
            </Box>
            <Warning mb="12px">
              <Text fontSize="m">
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
