import React, { PureComponent } from 'react';
import moment, { Moment } from 'moment';

// components
import Dropdown from 'components/UI/Dropdown';
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';
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
  border-radius: 5px;
`;

const DropdownContainer = styled.div`
  position: relative;
  cursor: pointer;
`;

const DropdownItemIcon = styled(Icon)`
  width: 11px;
  height: 6px;
  fill: ${colors.label};
  margin-top: 1px;
  margin-left: 4px;
`;

type Props  = {
  startAtMoment: Moment | null;
  endAtMoment: Moment | null;
  onChange: (startAtMoment: Moment | null, endAtMoment: Moment | null) => void;
};

type State  = {
  dropdownOpened: boolean;
};

class TimeControl extends PureComponent<Props & InjectedIntlProps, State> {

  presets = [
    {
      id: 'previous30Days',
      label: <FormattedMessage {...messages.previous30Days} />,
      startAt: (now: Moment) => now.add(-30, 'd'),
      endAt: (now: Moment) => now,
    },
    {
      id: 'previous90Days',
      label: <FormattedMessage {...messages.previous90Days} />,
      startAt: (now: Moment) => now.add(-90, 'd'),
      endAt: (now: Moment) => now,
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
  }

  handleDatesChange = ({ startDate, endDate }: {startDate: Moment | null, endDate: Moment | null}) => {
    this.props.onChange(startDate, endDate);
  }

  isOutsideRange = () => (false);

  findActivePreset = () => {
    const { startAtMoment, endAtMoment } = this.props;
    if (!startAtMoment || !endAtMoment) return null;
    const now = moment();
    return this.presets.find(preset => {
      return preset.startAt(now).isSame(startAtMoment, 'day') && preset.endAt(now).isSame(endAtMoment, 'day');
    });
  }

  handlePresetClick = (preset) => () => {
    const now = moment();
    this.props.onChange(preset.startAt(now), preset.endAt(now));
  }

  render() {
    const { dropdownOpened } = this.state;
    const { startAtMoment, endAtMoment } = this.props;
    const activePreset = this.findActivePreset();

    return (
      <Container>
        <DropdownContainer>
          <Button
            style="text"
            onClick={this.toggleDropdown}
          >
            {activePreset ? activePreset.label : <FormattedMessage {...messages.customDateRange} />}
            <DropdownItemIcon name="dropdown" />
          </Button>
          <Dropdown
            width="200px"
            top="45px"
            opened={dropdownOpened}
            onClickOutside={this.toggleDropdown}
            content={
              <div>
                {this.presets.map(preset => (
                  <div key={preset.id} onClick={this.handlePresetClick(preset)} role="navigation">
                    {preset.label}
                    {activePreset && activePreset.id === preset.id && '*'}
                  </div>
                ))}
              </div>
            }
          />
        </DropdownContainer>

        <DateRangePicker
          startDateId={'startAt'}
          endDateId={'endAt'}
          startDate={startAtMoment}
          endDate={endAtMoment}
          onDatesChange={this.handleDatesChange}
          isOutsideRange={this.isOutsideRange}
        />
      </Container>
    );
  }
}

export default injectIntl<Props>(TimeControl);
