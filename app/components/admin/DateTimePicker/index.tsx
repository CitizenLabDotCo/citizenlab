// must be at the top, before other imports!
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';

// Libraries
import * as React from 'react';
import * as moment from 'moment';
import styled from 'styled-components';

import { SingleDatePicker } from 'react-dates';

const Wrapper = styled.div`
  display: flex;
  position: relative;

  .SingleDatePickerInput {
    border-radius: 5px;

    .DateInput,
    .DateInput_input {
      background: transparent;
    }
  }
`;

const TimeWrapper = styled.div`
  align-items: center;
  border-radius: 0 5px 5px 0;
  border: 1px solid #dbdbdb;
  color: #484848;
  display: flex;
  font-size: 18px;
  justify-content: space-between;
  margin-left: -1px;

  input {
    font-size: 18px;
    font-weight: 200;
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

export default class DateTimePicker extends React.PureComponent<Props, State> {
  state: State;

  constructor (props) {
    super(props as any);

    this.state = {
      focused: false,
      selectedMoment: props.value ? moment(props.value) : moment().second(0),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value && nextProps.value !== this.props.value) {
      this.setState({ selectedMoment: moment(nextProps.value) });
    }
  }

  componentDidMount() {
    // Update the parent component value, useful when initializing a new picker
    this.updateDateTime(this.state.selectedMoment);
  }

  updateDateTime = (newMoment: moment.Moment) => {
    if (this.props.onChange) {
      this.props.onChange(newMoment);
    }
    this.setState({ selectedMoment: newMoment });
  }

  handleDateChange = (dateMoment: moment.Moment) => {
    // const newMoment = this.state.selectedMoment.clone();
    // newMoment.dayOfYear(dateMoment.dayOfYear());
    // this.updateDateTime(newMoment);

    this.updateDateTime(dateMoment);
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
    const { selectedMoment, focused } = this.state;

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
