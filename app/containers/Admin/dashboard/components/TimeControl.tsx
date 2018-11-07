import React, { PureComponent } from 'react';
import { Moment } from 'moment';

// components
import Dropdown from 'components/UI/Dropdown';
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';
import DateRangePicker from 'components/admin/DateRangePicker';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

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

  render() {
    const { dropdownOpened } = this.state;
    const { startAtMoment, endAtMoment } = this.props;

    return (
      <Container>
        <DropdownContainer>
          <Button
            style="text"
            onClick={this.toggleDropdown}
          >
            Date range
            <DropdownItemIcon name="dropdown" />
          </Button>
          <Dropdown
            width="200px"
            top="45px"
            opened={dropdownOpened}
            onClickOutside={this.toggleDropdown}
            content={
              <div>
                Time options
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
