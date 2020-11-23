// must be at the top, before other imports!
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';

// libraries
import React from 'react';
import moment from 'moment';
import { SingleDatePicker } from 'react-dates';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  width: 245px;
  display: flex;
  position: relative;
  border-radius: ${(props: any) => props.theme.borderRadius};
  border: solid 1px #ccc;

  input {
    font-size: ${fontSizes.base}px;
    font-weight: 400;
    outline: none;
    box-shadow: none;
    border: none;
    border-radius: 0;
    background: transparent;
  }

  .SingleDatePickerInput {
    outline: none;
    box-shadow: none;
    border: none;
    border-right: solid 1px #ccc;
    border-radius: 0;
    background: transparent;

    .DateInput {
      background: transparent;

      .DateInput_fang {
        z-index: 1000 !important;
      }

      input {
        border-bottom: solid 2px transparent;

        &.DateInput_input__focused {
          border-bottom: solid 2px #00a699;
        }
      }
    }
    .DateInput_input {
      color: inherit;
    }
  }

  .SingleDatePicker_picker {
    top: 69px !important;
    left: -1px !important;
  }

  .CalendarMonth_caption {
    color: inherit;
  }
`;

const TimeWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 10px;
  padding-right: 10px;

  input {
    width: 40px;
  }

  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    opacity: 1;
  }
`;

const TimeSeparator = styled.div`
  padding-left: 5px;
  padding-right: 5px;
`;

interface Props {
  value: string | undefined;
  onChange: (arg: moment.Moment) => void;
}

interface State {
  focused: boolean;
  selectedMoment: moment.Moment;
}

class DateTimePicker extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      focused: false,
      selectedMoment: props.value ? moment(props.value) : moment().second(0),
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.value !== this.props.value) {
      this.setState({ selectedMoment: moment(this.props.value) });
    }
  }

  componentDidMount() {
    // Update the parent component value, useful when initializing a new picker
    this.updateDateTime(this.state.selectedMoment);
  }

  updateDateTime = (newMoment: moment.Moment) => {
    this.setState({ selectedMoment: newMoment });
    this.props.onChange(newMoment);
  };

  handleDateChange = (dateMoment: moment.Moment | null) => {
    if (dateMoment) {
      this.updateDateTime(
        dateMoment.set({
          hour: this.state.selectedMoment.get('hour'),
          minute: this.state.selectedMoment.get('minute'),
          second: this.state.selectedMoment.get('second'),
        })
      );
    }
  };

  createTimeChangeHandler = (unit: 'hour' | 'minute') => (event) => {
    const { value } = event.target;
    const newMoment = this.state.selectedMoment.clone();
    newMoment.set(unit, value);
    this.updateDateTime(newMoment);
  };

  handleFocusChange = ({ focused }) => {
    this.setState({ focused });
  };

  isOutsideRange = () => {
    return false;
  };

  render() {
    const { selectedMoment, focused } = this.state;
    const hours = parseInt(selectedMoment.format('HH'), 10);
    const minutes = parseInt(selectedMoment.format('mm'), 10);

    return (
      <Container>
        <SingleDatePicker
          id="singledatepicker"
          date={selectedMoment}
          onDateChange={this.handleDateChange}
          focused={focused}
          onFocusChange={this.handleFocusChange}
          numberOfMonths={1}
          firstDayOfWeek={1}
          displayFormat="DD/MM/YYYY"
          isOutsideRange={this.isOutsideRange}
        />
        <TimeWrapper>
          <input
            type="number"
            min="0"
            aria-valuemin={0}
            max="23"
            aria-valuemax={23}
            aria-valuenow={hours}
            step="1"
            value={hours}
            onChange={this.createTimeChangeHandler('hour')}
          />
          <TimeSeparator>:</TimeSeparator>
          <input
            type="number"
            min="0"
            aria-valuemin={0}
            max="59"
            aria-valuemax={59}
            aria-valuenow={minutes}
            step="1"
            value={minutes}
            onChange={this.createTimeChangeHandler('minute')}
          />
        </TimeWrapper>
      </Container>
    );
  }
}

export default DateTimePicker;
