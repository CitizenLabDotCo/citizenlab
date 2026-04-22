import React, { useMemo, useState } from 'react';

import { colors, Box, Text } from '@citizenlab/cl2-component-library';
import moment from 'moment-timezone';
import 'react-day-picker/style.css';
import { transparentize } from 'polished';
import { DayPicker, PropsBase } from 'react-day-picker';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import TimeInput from 'components/admin/DateTimeSelection/TimeInput';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import { userTimezone } from 'utils/dateUtils';

import { getLocale } from '../../_shared/locales';
import messages from '../messages';
import { Props } from '../typings';

import { generateModifiers } from './utils/generateModifiers';
import { getEndMonth, getStartMonth } from './utils/getStartEndMonth';
import { getUpdatedRange } from './utils/getUpdatedRange';
import {
  isDayBlocked,
  adjustRangeTimes,
  getStartTimeMinTime,
  getEndTimeMaxTime,
} from './utils/utils';
const disabledBackground = colors.grey300;
const disabledBackground2 = transparentize(0.33, disabledBackground);
const disabledBackground3 = transparentize(0.66, disabledBackground);

const selectedBackground = colors.teal100;
const selectedBackground2 = transparentize(0.33, selectedBackground);
const selectedBackground3 = transparentize(0.66, selectedBackground);

const DayPickerStyles = styled.div`
  .rdp-root {
    --rdp-accent-color: ${colors.teal700};
    --rdp-accent-background-color: ${selectedBackground};
  }

  .rdp-range_middle > button {
    font-size: 14px;
  }

  .is-disabled-start {
    background-color: ${disabledBackground};
    color: ${colors.grey800};
    border-radius: 50% 0 0 50%;
  }

  .is-disabled-start > button {
    cursor: pointer;
  }

  .is-disabled-middle {
    background-color: ${disabledBackground};
    color: ${colors.grey800};
  }

  .is-disabled-middle > button {
    cursor: not-allowed;
  }

  .is-disabled-end {
    background-color: ${disabledBackground};
    color: ${colors.grey800};
    border-radius: 0 50% 50% 0;
  }

  .is-disabled-end > button {
    cursor: pointer;
  }

  .is-disabled-gradient_one {
    background: linear-gradient(
      90deg,
      ${disabledBackground},
      ${disabledBackground2}
    );
  }

  .is-disabled-gradient_two {
    background: linear-gradient(
      90deg,
      ${disabledBackground2},
      ${disabledBackground3}
    );
  }

  .is-disabled-gradient_three {
    background: linear-gradient(90deg, ${disabledBackground3}, ${colors.white});
  }

  .is-disabled-single {
    background: ${disabledBackground};
    color: ${colors.grey800};
    border-radius: 50%;
  }

  .is-disabled-single > button {
    cursor: not-allowed;
  }

  .is-full-occupied-day > button {
    cursor: not-allowed;
  }

  .is-no-time-available > button {
    cursor: not-allowed;
  }
  .is-selected-gradient_one {
    background: linear-gradient(
      90deg,
      ${selectedBackground},
      ${selectedBackground2}
    );
  }

  .is-selected-gradient_two {
    background: linear-gradient(
      90deg,
      ${selectedBackground2},
      ${selectedBackground3}
    );
  }

  .is-selected-gradient_three {
    background: linear-gradient(90deg, ${selectedBackground3}, ${colors.white});
  }

  .is-selected-single-day {
    background: var(--rdp-accent-color);
    color: ${colors.white};
    border-radius: 50%;
  }

  .is-boundary-disabled-end-selected-start {
    background: linear-gradient(
      135deg,
      ${disabledBackground} calc(50% - 1px),
      ${colors.white} calc(50% - 1px),
      ${colors.white} calc(50% + 1px),
      ${selectedBackground} calc(50% + 1px)
    ) !important;
    border-radius: 0 !important;
  }

  .is-boundary-disabled-start-selected-end {
    background: linear-gradient(
      135deg,
      ${selectedBackground} calc(50% - 1px),
      ${colors.white} calc(50% - 1px),
      ${colors.white} calc(50% + 1px),
      ${disabledBackground} calc(50% + 1px)
    ) !important;
    border-radius: 0 !important;
  }

  .is-boundary-disabled-end-disabled-start {
    background: linear-gradient(
      135deg,
      ${disabledBackground} calc(50% - 1px),
      ${colors.white} calc(50% - 1px),
      ${colors.white} calc(50% + 1px),
      ${disabledBackground} calc(50% + 1px)
    ) !important;
    border-radius: 0 !important;
  }
`;

const TimeInputContainer = styled(Box)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 16px 4px 4px 4px;
  width: 95%;
  border-top: 1px solid ${colors.grey300};
`;

const modifiersClassNames = {
  isDisabledStart: 'is-disabled-start',
  isDisabledMiddle: 'is-disabled-middle',
  isDisabledEnd: 'is-disabled-end',
  isDisabledGradient_one: 'is-disabled-gradient_one',
  isDisabledGradient_two: 'is-disabled-gradient_two',
  isDisabledGradient_three: 'is-disabled-gradient_three',
  isDisabledSingle: 'is-disabled-single',
  isSelectedStart: 'rdp-range_start',
  isSelectedMiddle: 'rdp-range_middle',
  isSelectedEnd: 'rdp-range_end',
  isSelectedGradient_one: 'is-selected-gradient_one',
  isSelectedGradient_two: 'is-selected-gradient_two',
  isSelectedGradient_three: 'is-selected-gradient_three',
  isSelectedSingleDay: 'is-selected-single-day',
  isBoundaryDisabledEndSelectedStart: 'is-boundary-disabled-end-selected-start',
  isBoundaryDisabledStartSelectedEnd: 'is-boundary-disabled-start-selected-end',
  isBoundaryDisabledEndDisabledStart: 'is-boundary-disabled-end-disabled-start',
  isFullOccupiedDay: 'is-full-occupied-day',
  isNoTimeAvailable: 'is-no-time-available',
};

const Calendar = ({
  selectedRange,
  disabledRanges = [],
  startMonth: _startMonth,
  endMonth: _endMonth,
  defaultMonth,
  onUpdateRange,
  className,
}: Props) => {
  const { data: tenant } = useAppConfiguration();
  const timeZone = tenant?.data.attributes.settings.core.timezone;
  const gmtOffset = timeZone ? moment().tz(timeZone).format('Z') : '';

  const isPhaseDatetimeSetupEnabled = useFeatureFlag({
    name: 'phase_datetime_setup',
  });
  const { formatMessage } = useIntl();

  const startMonth = getStartMonth({
    startMonth: _startMonth,
    selectedRange,
    disabledRanges,
    defaultMonth,
  });

  const endMonth = getEndMonth({
    endMonth: _endMonth,
    selectedRange,
    disabledRanges,
    defaultMonth,
  });

  const isSingleDaySelection =
    selectedRange.from &&
    selectedRange.to &&
    selectedRange.to.getTime() - selectedRange.from.getTime() ===
      24 * 60 * 60 * 1000;

  const locale = useLocale();

  const startTimeMinTime = getStartTimeMinTime(
    selectedRange.from,
    disabledRanges
  );
  const endTimeMaxTime = getEndTimeMaxTime(selectedRange.to, disabledRanges);

  const [selectedStartTime, setSelectedStartTime] = useState<Date | null>(null);
  const [selectedEndTime, setSelectedEndTime] = useState<Date | null>(null);

  const displayStartTime =
    selectedStartTime ||
    startTimeMinTime ||
    selectedRange.from ||
    new Date(new Date().setHours(0, 0, 0, 0));

  const displayEndTime =
    selectedEndTime ||
    endTimeMaxTime ||
    selectedRange.to ||
    new Date(new Date().setHours(23, 59, 0, 0));

  const modifiers = useMemo(
    () =>
      generateModifiers({
        selectedRange,
        disabledRanges,
      }),
    [selectedRange, disabledRanges]
  );

  const handleStartTimeChange = (time: Date) => {
    setSelectedStartTime(time);

    if (!selectedRange.from) {
      return;
    }
    const newDate = new Date(selectedRange.from);
    newDate.setHours(time.getHours());
    newDate.setMinutes(time.getMinutes());

    onUpdateRange({
      from: newDate,
      to: selectedRange.to,
    });
  };

  const handleEndTimeChange = (time: Date) => {
    setSelectedEndTime(time);

    if (!selectedRange.to) {
      return;
    }

    const newDate = new Date(selectedRange.to);
    newDate.setHours(time.getHours());
    newDate.setMinutes(time.getMinutes());

    onUpdateRange({
      from: selectedRange.from,
      to: newDate,
    });
  };

  const handleDayClick: PropsBase['onDayClick'] = (
    day,
    { isDisabledMiddle, isDisabledSingle }
  ) => {
    if (
      isDisabledMiddle ||
      isDisabledSingle ||
      isDayBlocked(day, disabledRanges)
    ) {
      return;
    }

    const updatedRange = getUpdatedRange({
      selectedRange,
      disabledRanges,
      clickedDate: day,
    });

    const { from: newFrom, to: newTo } = adjustRangeTimes({
      from: updatedRange.from,
      to: updatedRange.to,
      selectedStartTime: displayStartTime,
      selectedEndTime: displayEndTime,
    });

    const finalFrom = newFrom ? new Date(newFrom) : null;
    const finalTo = newTo ? new Date(newTo) : null;

    if (finalFrom) {
      const minTime = getStartTimeMinTime(finalFrom, disabledRanges);
      if (minTime) {
        finalFrom.setHours(minTime.getHours(), minTime.getMinutes());
        setSelectedStartTime(minTime);
      }
    }

    if (finalTo) {
      const maxTime = getEndTimeMaxTime(finalTo, disabledRanges);
      if (maxTime) {
        finalTo.setHours(maxTime.getHours(), maxTime.getMinutes());
        setSelectedEndTime(maxTime);
      }
    }

    onUpdateRange({ from: finalFrom || undefined, to: finalTo || undefined });
  };

  return (
    <DayPickerStyles>
      <DayPicker
        mode="range"
        numberOfMonths={2}
        captionLayout="dropdown"
        fixedWeeks
        locale={getLocale(locale)}
        startMonth={startMonth}
        endMonth={endMonth}
        defaultMonth={defaultMonth}
        modifiers={modifiers}
        modifiersClassNames={modifiersClassNames}
        onDayClick={handleDayClick}
        // This NOOP and empty array are necessary because otherwise the
        // DayPicker will rely on its internal state to manage the selected
        // range rather than being controlled by our state.
        selected={[] as any}
        onSelect={NOOP}
        timeZone={userTimezone}
        className={className}
      />
      {isPhaseDatetimeSetupEnabled &&
        (isSingleDaySelection ? (
          <Box mt="16px">
            <Text m="0" mb="8px" fontSize="l">
              {formatMessage(messages.sameDaySelection)}
            </Text>
            <Warning w="95%">
              {formatMessage(messages.sameDaySelectionWarning, {
                timezone: gmtOffset,
              })}
            </Warning>
          </Box>
        ) : (
          <TimeInputContainer>
            <Box display="flex" gap="8px" alignItems="center">
              <Text m="0">{formatMessage(messages.startTime)}</Text>
              <TimeInput
                selectedTime={displayStartTime}
                onChange={handleStartTimeChange}
                minTime={startTimeMinTime}
              />
            </Box>
            <Box display="flex" gap="8px" alignItems="center">
              <Text m="0" color={selectedRange.to ? 'black' : 'grey600'}>
                {formatMessage(messages.endTime)}
              </Text>
              {selectedRange.to ? (
                <TimeInput
                  selectedTime={displayEndTime}
                  onChange={handleEndTimeChange}
                  maxTime={endTimeMaxTime}
                />
              ) : (
                <Box
                  p="10px"
                  bgColor={colors.grey100}
                  border={`1px solid ${colors.grey300}`}
                  borderRadius="4px"
                  display="flex"
                >
                  <Text m="0" color="grey600">
                    {formatMessage(messages.openEnded)}
                  </Text>
                </Box>
              )}
            </Box>
          </TimeInputContainer>
        ))}
    </DayPickerStyles>
  );
};

const NOOP = () => {};

export default Calendar;
