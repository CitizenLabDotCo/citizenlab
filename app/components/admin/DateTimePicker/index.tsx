// Libraries
import * as React from 'react';
import * as moment from 'moment';
import styled from 'styled-components';

import { SingleDatePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';

const Wrapper = styled.div`
  display: flex;
  position: relative;
  z-index: 5;
`;

const TimeWrapper = styled.div`
  border: 1px solid #dbdbdb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-left: -1px;

  input {
    text-align: center;
  }
`;

interface Props {
  value: string | undefined;
  onChange: Function;
}

interface State {
  focused: boolean;
  selectedMoment: moment.Moment;
}

export default class DateTimePicker extends React.Component<Props, State> {
  constructor (props) {
    super();

    this.state = {
      focused: false,
      selectedMoment: props.value ? moment(props.value) : moment().second(0),
    };
  }

  updateDateTime = (newMoment: moment.Moment) => {
    if (this.props.onChange) {
      this.props.onChange(newMoment);
    }
    this.setState({ selectedMoment: newMoment });
  }

  handleDateChange = (dateMoment) => {
    const newMoment = this.state.selectedMoment.clone();
    newMoment.dayOfYear(dateMoment.dayOfYear());

    this.updateDateTime(newMoment);
  }

  createTimeChangeHandler = (unit: 'hour' |  'minute') => {
    return (event) => {
      const newMoment = this.state.selectedMoment.clone();
      newMoment[unit](event.target.value);

      this.updateDateTime(newMoment);
    };
  }

  handleFocusChange = ({ focused }) => {
    this.setState({ focused });
  }

  isOutsideRange = () => {
    return false;
  }

  render () {
    const { selectedMoment } = this.state;

    return (
      <Wrapper>
        <SingleDatePicker
          date={selectedMoment}
          onDateChange={this.handleDateChange}
          focused={this.state.focused}
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
            aria-valuemin="0"
            max="23"
            aria-valuemax="23"
            aria-valuenow={selectedMoment.format('H')}
            value={selectedMoment.format('H')}
            onChange={this.createTimeChangeHandler('hour')}
          />
          <div>:</div>
          <input
            type="number"
            min="0"
            aria-valuemin="0"
            max="59"
            aria-valuemax="59"
            aria-valuenow={selectedMoment.format('m')}
            value={selectedMoment.format('m')}
            onChange={this.createTimeChangeHandler('minute')}
          />

        </TimeWrapper>
      </Wrapper>
    );
  }
}
