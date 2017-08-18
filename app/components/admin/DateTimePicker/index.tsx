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


interface Props {
  dateTime: string | undefined;
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
      selectedMoment: props.dateTime ? moment(props.dateTime) : moment(),
    };
  }

  handleDateChange = (dateMoment) => {
    const newMoment = this.state.selectedMoment.clone();
    newMoment.dayOfYear(dateMoment.dayOfYear());

    this.setState({ selectedMoment: newMoment });
  }

  handleTimeChange = (event) => {
    let newTime = event.target.value.replace(/\D/, '').slice(0, 4);
    newTime = `${newTime}${'0'.repeat(4 - newTime.length)}`;
    const hours = parseInt(newTime.slice(0,2), 10);
    const minutes = parseInt(newTime.slice(2,4), 10);

    const newMoment = this.state.selectedMoment.clone();
    newMoment.hour(hours).minute(minutes);

    this.setState({ selectedMoment: newMoment });
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
          keepOpenOnDateSelect={true}
        />

        <input
          type="text"
          value={selectedMoment.format('HH:mm')}
          onChange={this.handleTimeChange}
        />
      </Wrapper>
    );
  }
}
