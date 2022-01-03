import React, { PureComponent } from 'react';
import moment, { Moment } from 'moment';

// components
import Button from 'components/UI/Button';
import { Icon, Dropdown } from '@citizenlab/cl2-component-library';
import DateRangePicker from 'components/admin/DateRangePicker';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  border-radius: ${(props: any) => props.theme.borderRadius};
  align-items: center;
`;

const DropdownContainer = styled.div`
  position: relative;
  cursor: pointer;
`;

const StyledButton = styled(Button)`
  margin-right: 15px;
`;

const DropdownItemIcon = styled(Icon)`
  width: 11px;
  height: 6px;
  fill: ${colors.label};
  margin-top: 1px;
  margin-left: 4px;
`;

const DropdownListItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  margin: 0px;
  margin-bottom: 4px;
  padding: 10px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  cursor: pointer;
  transition: all 80ms ease-out;

  &:hover,
  &:focus,
  &.selected {
    background: ${colors.clDropdownHoverBackground};
  }
`;

type Props = {
  startAtMoment?: Moment | null;
  endAtMoment: Moment | null;
  onChange: (
    startAtMoment: Moment | null | undefined,
    endAtMoment: Moment | null
  ) => void;
};

type State = {
  dropdownOpened: boolean;
};

class TimeControl extends PureComponent<Props & InjectedIntlProps, State> {
  private presets = [
    {
      id: 'allTime',
      label: <FormattedMessage {...messages.allTime} />,
      endAt: () => moment(),
      startAt: () => undefined,
    },
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

  constructor(props) {
    super(props);
    this.state = {
      dropdownOpened: false,
    };
  }

  toggleDropdown = () => {
    this.setState({ dropdownOpened: !this.state.dropdownOpened });
  };

  handleDatesChange = ({
    startDate,
    endDate,
  }: {
    startDate: Moment | null;
    endDate: Moment | null;
  }) => {
    this.props.onChange(startDate, endDate);
  };

  findActivePreset = () => {
    const { startAtMoment, endAtMoment } = this.props;

    if (!endAtMoment) return null;

    return this.presets.find((preset) => {
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

  handlePresetClick = (preset) => () => {
    this.props.onChange(preset.startAt(), preset.endAt());
  };

  render() {
    const { dropdownOpened } = this.state;
    const { startAtMoment, endAtMoment } = this.props;
    const activePreset = this.findActivePreset();

    return (
      <Container>
        <DropdownContainer>
          <StyledButton
            buttonStyle="text"
            onClick={this.toggleDropdown}
            padding="0px"
            className="e2e-open-time-presets"
          >
            {activePreset ? (
              activePreset.label
            ) : (
              <FormattedMessage {...messages.customDateRange} />
            )}
            <DropdownItemIcon name="dropdown" />
          </StyledButton>
          <Dropdown
            width="200px"
            top="45px"
            opened={dropdownOpened}
            onClickOutside={this.toggleDropdown}
            className="e2e-preset-items"
            content={
              <>
                {this.presets.map((preset) => (
                  <DropdownListItem
                    key={preset.id}
                    onClick={this.handlePresetClick(preset)}
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
          startDateId={'startAt'}
          endDateId={'endAt'}
          startDate={startAtMoment === undefined ? null : startAtMoment}
          endDate={endAtMoment}
          onDatesChange={this.handleDatesChange}
        />
      </Container>
    );
  }
}

export default injectIntl<Props>(TimeControl);
