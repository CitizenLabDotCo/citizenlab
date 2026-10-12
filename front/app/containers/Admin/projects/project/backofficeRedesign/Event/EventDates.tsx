import React, { Dispatch, SetStateAction, useState } from 'react';

import {
  Box,
  Button,
  Icon,
  Text,
  Tooltip,
  bo,
  colors,
  fontSizes,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { addMinutes, isSameDay } from 'date-fns';
import styled from 'styled-components';
import { CLErrors } from 'typings';

import { IEventProperties } from 'api/events/types';

import dateTimeMessages from 'containers/Admin/projects/project/events/components/DateTimeSelection/messages';
import eventMessages from 'containers/Admin/projects/project/events/messages';
import useEventDateTimes from 'containers/Admin/projects/project/events/useEventDateTimes';

import DateSinglePicker from 'components/admin/DatePickers/DateSinglePicker';
import TimeInput from 'components/admin/TimeSelection/TimeInput';
import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';
import { getGmtOffset } from 'utils/dateUtils';

import messages from './messages';
import SetupCard from './SetupCard';

const withTimeOf = (date: Date, time: Date) => {
  const result = new Date(date);
  result.setHours(time.getHours(), time.getMinutes());
  return result;
};

const Arrow = () => (
  <Icon
    name="arrow-right"
    width="14px"
    height="14px"
    fill={bo.colors.crumbSeparator}
  />
);

// The date and time pickers render their own bordered trigger buttons. Inside
// the row they read as plain text segments, so the row draws the only border.
// Their popups mount inside the segment too, so the rules skip those.
const FieldRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  height: 36px;
  padding: 0 6px 0 12px;
  box-sizing: border-box;
  border: 1px solid ${colors.grey300};
  border-radius: ${bo.borderRadius};
  background: ${colors.white};

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.tenantPrimary};
  }
`;

const Segment = styled.div`
  && button:not([data-tippy-root] button) {
    height: 28px;
    padding: 0 6px;
    border: none;
    border-radius: ${stylingConsts.borderRadius};
    box-shadow: none;
    background: transparent;
    font-size: ${fontSizes.xs}px;
    color: ${bo.colors.textHeadingStrong};
    white-space: nowrap;

    &:focus {
      border: none;
    }

    &:hover,
    &:focus-visible {
      background: ${colors.grey100};
      color: ${bo.colors.textHeadingStrong};
    }

    > div {
      margin-right: 0;
    }

    svg {
      display: none;
    }
  }
`;

interface Props {
  startAt: string;
  endAt: string;
  errors: CLErrors | null;
  setAttributeDiff: Dispatch<SetStateAction<IEventProperties>>;
}

const EventDates = ({ startAt, endAt, errors, setAttributeDiff }: Props) => {
  const { formatMessage, formatDate } = useIntl();
  const formatLongDate = (date: Date) =>
    formatDate(date, {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  const {
    platformTimezone,
    startAtDate,
    endAtDate,
    tenantTimeNow,
    updateStartAt,
    updateEndAt,
  } = useEventDateTimes({ startAt, endAt, setAttributeDiff });
  const [endDateAdded, setEndDateAdded] = useState(false);
  // A time change can push the end past midnight, which shows the end date too.
  const multiDay = endDateAdded || !isSameDay(startAtDate, endAtDate);

  // Keeps the start where it is. An end time at or before the start time
  // would end the event before it begins, so it gets a new event's length.
  const removeEndDate = () => {
    setEndDateAdded(false);
    const end = withTimeOf(startAtDate, endAtDate);
    updateEndAt(end > startAtDate ? end : addMinutes(startAtDate, 30));
  };

  return (
    <SetupCard title={formatMessage(eventMessages.eventDates)}>
      <FieldRow>
        <Box display="flex" mr="4px">
          <Icon
            name="calendar"
            width="16px"
            height="16px"
            fill={colors.coolGrey500}
          />
        </Box>
        <Segment>
          <DateSinglePicker
            id="event-start-date"
            selectedDate={startAtDate}
            formatDate={formatLongDate}
            onChange={(date) => updateStartAt(withTimeOf(date, startAtDate))}
          />
        </Segment>
        {multiDay && (
          <>
            <Arrow />
            <Segment>
              <DateSinglePicker
                id="event-end-date"
                selectedDate={endAtDate}
                formatDate={formatLongDate}
                onChange={(date) => updateEndAt(withTimeOf(date, endAtDate))}
              />
            </Segment>
            <Box ml="auto">
              <Tooltip
                content={formatMessage(messages.removeEndDate)}
                theme="dark"
              >
                <Button
                  buttonStyle="bo-text"
                  icon="close"
                  iconSize="14px"
                  width="24px"
                  height="24px"
                  padding="0"
                  ariaLabel={formatMessage(messages.removeEndDate)}
                  onClick={removeEndDate}
                />
              </Tooltip>
            </Box>
          </>
        )}
      </FieldRow>

      <FieldRow>
        <Box display="flex" mr="4px">
          <Icon
            name="clock"
            width="16px"
            height="16px"
            fill={colors.coolGrey500}
          />
        </Box>
        <Segment>
          <TimeInput selectedTime={startAtDate} onChange={updateStartAt} />
        </Segment>
        <Arrow />
        <Segment>
          <TimeInput selectedTime={endAtDate} onChange={updateEndAt} />
        </Segment>
      </FieldRow>
      <Error apiErrors={errors?.start_at} />
      <Error apiErrors={errors?.end_at} />

      <Box display="flex" alignItems="center" justifyContent="space-between">
        {multiDay ? (
          <span />
        ) : (
          <Button
            buttonStyle="bo-text"
            padding="2px"
            height="auto"
            fontSize={`${bo.controlFontSize}px`}
            fontWeight="400"
            textColor={colors.coolGrey600}
            textHoverColor={bo.colors.textHeadingStrong}
            onClick={() => setEndDateAdded(true)}
          >
            {formatMessage(messages.addEndDate)}
          </Button>
        )}
        {platformTimezone && (
          <Tooltip
            content={formatMessage(dateTimeMessages.timezoneInfo, {
              timezone: platformTimezone.replace(/_/g, ' '),
              gmtOffset: getGmtOffset(platformTimezone, tenantTimeNow),
            })}
            theme="dark"
          >
            <Box display="flex" alignItems="center" gap="6px" tabIndex={0}>
              <Icon
                name="globe"
                width="14px"
                height="14px"
                fill={colors.coolGrey600}
              />
              <Text as="span" m="0" fontSize="xs" color="coolGrey600">
                {formatMessage(messages.platformTime, {
                  timezone: platformTimezone,
                })}
              </Text>
            </Box>
          </Tooltip>
        )}
      </Box>
    </SetupCard>
  );
};

export default EventDates;
