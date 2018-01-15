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
  display: flex;
  position: relative;

  .SingleDatePickerInput {
    border-radius: 5px;

    .DateInput,
    .DateInput_input {
      font-family: 'visuelt', sans-serif !important;
      font-size: 16px;
      font-weight: 400;
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
  padding-left: 10px;
  padding-right: 10px;

  input {
    width: 35px;
    height: 100%;
    font-family: 'visuelt', sans-serif !important;
    font-size: 16px;
    font-weight: 400;
    text-align: center;
    outline: none;
    -moz-appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }
  }
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
    this.setState({ selectedMoment: newMoment });
    this.props.onChange(newMoment);
  }

  handleDateChange = (dateMoment: moment.Moment) => {
    this.updateDateTime(
      dateMoment.set({
        hour: this.state.selectedMoment.get('hour'),
        minute: this.state.selectedMoment.get('minute'), 
        second: this.state.selectedMoment.get('second')
      })
    );
  }

  createTimeChangeHandler = (unit: 'hour' | 'minute') => (event) => {
    const newMoment = this.state.selectedMoment.clone();
    newMoment.set(unit, event.target.value);
    console.log(newMoment);
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
            aria-valuenow={selectedMoment.format('HH')}
            value={selectedMoment.format('HH')}
            onChange={this.createTimeChangeHandler('hour')}
          />
          <div>:</div>
          <input
            type="number"
            min="0"
            aria-valuemin="0"
            max="59"
            aria-valuemax="59"
            aria-valuenow={selectedMoment.format('mm')}
            value={selectedMoment.format('mm')}
            onChange={this.createTimeChangeHandler('minute')}
          />
        </TimeWrapper>
      </Wrapper>
    );
  }
}

export default localize<Props>(DateTimePicker);
