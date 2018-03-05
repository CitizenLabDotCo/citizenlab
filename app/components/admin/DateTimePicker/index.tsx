// must be at the top, before other imports!
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';

// libraries
import * as React from 'react';
import * as moment from 'moment';
import { SingleDatePicker } from 'react-dates';

// styling
import styled from 'styled-components';

// i18n
import localize, { injectedLocalized } from 'utils/localize';

const Wrapper = styled.div`
  display: inline-flex;
  position: relative;
  border-radius: 5px;
  border: solid 1px #ccc;

  input {
    color: #333;
    font-family: 'visuelt', sans-serif !important;
    font-size: 16px;
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
  }

  .SingleDatePicker_picker {
    top: 69px !important;
    left: -1px !important;
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

class DateTimePicker extends React.PureComponent<Props & injectedLocalized, State> {
  constructor (props) {
    super(props);
    this.state = {
      focused: false,
      selectedMoment: (props.value ? moment(props.value) : moment().second(0)),
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.setState({ selectedMoment: moment(this.props.value) });
    }
  }

  componentDidMount() {
    // Update the parent component value, useful when initializing a new picker
    this.updateDateTime(this.state.selectedMoment);
  }

  componentDidCatch(error) {
    console.log(error);
  }

  updateDateTime = (newMoment: moment.Moment) => {
    this.setState({ selectedMoment: newMoment });
    this.props.onChange(newMoment);
  }

  handleDateChange = (dateMoment: moment.Moment | null) => {
    if (dateMoment) {
      this.updateDateTime(
        dateMoment.set({
          hour: this.state.selectedMoment.get('hour'),
          minute: this.state.selectedMoment.get('minute'),
          second: this.state.selectedMoment.get('second')
        })
      );
    }
  }

  createTimeChangeHandler = (unit: 'hour' | 'minute') => (event) => {
    const { value } = event.target;
    const newMoment = this.state.selectedMoment.clone();
    newMoment.set(unit, value);
    this.updateDateTime(newMoment);
  }

  handleFocusChange = ({ focused }) => {
    this.setState({ focused });
  }

  isOutsideRange = () => {
    return false;
  }

  render () {
    const { selectedMoment, focused } = this.state;
    const hours = parseInt(selectedMoment.format('HH'), 10);
    const minutes = parseInt(selectedMoment.format('mm'), 10);

    return (
      <Wrapper>
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
      </Wrapper>
    );
  }
}

export default localize<Props>(DateTimePicker);
