import React, { useState } from 'react';

import {
  Icon,
  Dropdown,
  colors,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import { getMonth, isBefore, isSameDay, subDays, subYears } from 'date-fns';
import styled from 'styled-components';

import DateRangePicker from 'components/admin/DatePickers/DateRangePicker';
import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

const Container = styled.div`
  display: flex;
  border-radius: ${(props) => props.theme.borderRadius};
  align-items: center;
`;

const DropdownContainer = styled.div`
  position: relative;
  cursor: pointer;
`;

const StyledButton = styled(ButtonWithLink)`
  margin-right: 15px;
`;

const DropdownItemIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  margin-left: 4px;
`;

const DropdownListItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  margin: 0px;
  margin-bottom: 4px;
  padding: 10px;
  border-radius: ${(props) => props.theme.borderRadius};
  cursor: pointer;
  transition: all 80ms ease-out;

  &:hover,
  &:focus,
  &.selected {
    background: ${colors.grey300};
  }
`;

interface Props {
  showAllTime?: boolean;
  startAtMoment?: Date | null;
  endAtMoment: Date | null;
  minDate?: Date;
  tooltip?: string;
  onChange: (startAtMoment: Date | null, endAtMoment: Date | null) => void;
}

const TimeControl = ({
  showAllTime = true,
  startAtMoment,
  endAtMoment,
  minDate,
  tooltip,
  onChange,
}: Props) => {
  const [dropdownOpened, setDropdownOpened] = useState(false);

  const presets = [
    ...(showAllTime
      ? [
          {
            id: 'allTime',
            label: <FormattedMessage {...messages.allTime} />,
            endAt: () => new Date(),
            startAt: () => undefined,
          },
        ]
      : []),
    {
      id: 'previousWeek',
      label: <FormattedMessage {...messages.previousWeek} />,
      endAt: () => new Date(),
      startAt: () => subDays(new Date(), 7),
    },
    {
      id: 'previous30Days',
      label: <FormattedMessage {...messages.previous30Days} />,
      endAt: () => new Date(),
      startAt: () => subDays(new Date(), 30),
    },
    {
      id: 'previous90Days',
      label: <FormattedMessage {...messages.previous90Days} />,
      endAt: () => new Date(),
      startAt: () => subDays(new Date(), 90),
    },
    {
      id: 'previousYear',
      label: <FormattedMessage {...messages.previousYear} />,
      endAt: () => new Date(),
      startAt: () => subYears(new Date(), 1),
    },
  ];

  const toggleDropdown = () => {
    setDropdownOpened((dropdownOpened) => !dropdownOpened);
  };

  const handleDatesChange = ({
    startDate,
    endDate,
  }: {
    startDate: Date | null;
    endDate: Date | null;
  }) => {
    const startsBeforeMin =
      minDate && startDate && isBefore(startDate, minDate);

    // Don't set the start date if there is a minDate and the new date is before the min date or null
    if (minDate && (startsBeforeMin || !startDate)) {
      return;
    }

    onChange(startDate, endDate);
  };

  const findActivePreset = () => {
    if (!endAtMoment) return null;
    return presets.find((preset) => {
      const startAt = preset.startAt();
      if (startAt === undefined) {
        return (
          startAtMoment === undefined && isSameDay(preset.endAt(), endAtMoment)
        );
      } else {
        return (
          !!startAtMoment &&
          isSameDay(startAt, startAtMoment) &&
          isSameDay(preset.endAt(), endAtMoment)
        );
      }
    });
  };

  const handlePresetClick = (preset) => () => {
    onChange(preset.startAt(), preset.endAt());
  };

  const activePreset = findActivePreset();

  return (
    <Container className="intercom-admin-dashboard-time-control">
      <DropdownContainer>
        <StyledButton
          buttonStyle="text"
          onClick={toggleDropdown}
          padding="0px"
          className="e2e-open-time-presets"
        >
          {activePreset ? (
            activePreset.label
          ) : (
            <FormattedMessage {...messages.customDateRange} />
          )}
          <DropdownItemIcon name="chevron-down" />
        </StyledButton>
        <Dropdown
          width="200px"
          top="45px"
          opened={dropdownOpened}
          onClickOutside={toggleDropdown}
          className="e2e-preset-items"
          content={
            <>
              {presets.map((preset) => (
                <DropdownListItem
                  key={preset.id}
                  onClick={handlePresetClick(preset)}
                  role="navigation"
                  className={
                    activePreset && activePreset.id === preset.id
                      ? 'selected'
                      : ''
                  }
                >
                  {preset.label}
                </DropdownListItem>
              ))}
            </>
          }
        />
      </DropdownContainer>
      <DateRangePicker
        selectedRange={{
          from: startAtMoment ?? undefined,
          to: endAtMoment ?? undefined,
        }}
        startMonth={minDate ?? undefined}
        disabled={
          minDate
            ? {
                from: new Date(getMonth(minDate)),
                to: minDate,
              }
            : undefined
        }
        onUpdateRange={({ from, to }) => {
          handleDatesChange({
            startDate: from ?? null,
            endDate: to ?? null,
          });
        }}
      />
      {tooltip && <IconTooltip ml="12px" content={tooltip} />}
    </Container>
  );
};

export default TimeControl;
