import React, { useState } from 'react';

import {
  Icon,
  Dropdown,
  colors,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import { getMonth } from 'date-fns';
import moment, { Moment } from 'moment';
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
  startAtMoment?: Moment | null;
  endAtMoment: Moment | null;
  minDate?: Moment;
  tooltip?: string;
  onChange: (startAtMoment: Moment | null, endAtMoment: Moment | null) => void;
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
            endAt: () => moment(),
            startAt: () => undefined,
          },
        ]
      : []),
    {
      id: 'previousWeek',
      label: <FormattedMessage {...messages.previousWeek} />,
      endAt: () => moment(),
      startAt: () => moment().subtract(7, 'd'),
    },
    {
      id: 'previous30Days',
      label: <FormattedMessage {...messages.previous30Days} />,
      endAt: () => moment(),
      startAt: () => moment().subtract(30, 'd'),
    },
    {
      id: 'previous90Days',
      label: <FormattedMessage {...messages.previous90Days} />,
      endAt: () => moment(),
      startAt: () => moment().subtract(90, 'd'),
    },
    {
      id: 'previousYear',
      label: <FormattedMessage {...messages.previousYear} />,
      endAt: () => moment(),
      startAt: () => moment().subtract(1, 'y'),
    },
  ];

  const toggleDropdown = () => {
    setDropdownOpened((dropdownOpened) => !dropdownOpened);
  };

  const handleDatesChange = ({
    startDate,
    endDate,
  }: {
    startDate: Moment | null;
    endDate: Moment | null;
  }) => {
    const isBefore = minDate && startDate && startDate.isBefore(minDate);

    // Don't set the start date if there is a minDate and the new date is before the min date or null
    if (minDate && (isBefore || !startDate)) {
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
          startAtMoment === undefined &&
          preset.endAt().isSame(endAtMoment, 'day')
        );
      } else {
        return (
          !!startAtMoment &&
          startAt.isSame(startAtMoment, 'day') &&
          preset.endAt().isSame(endAtMoment, 'day')
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
          from: startAtMoment ? startAtMoment.toDate() : undefined,
          to: endAtMoment ? endAtMoment.toDate() : undefined,
        }}
        startMonth={minDate?.toDate()}
        disabled={
          minDate
            ? {
                from: new Date(getMonth(minDate.toDate())),
                to: minDate.toDate(),
              }
            : undefined
        }
        onUpdateRange={({ from, to }) => {
          handleDatesChange({
            startDate: from ? moment(from) : null,
            endDate: to ? moment(to) : null,
          });
        }}
      />
      {tooltip && <IconTooltip ml="12px" content={tooltip} />}
    </Container>
  );
};

export default TimeControl;
