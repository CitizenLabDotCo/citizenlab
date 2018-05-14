// must be at the top, before other imports!
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';

// libraries
import * as React from 'react';
import * as moment from 'moment';
import { SingleDatePicker } from 'react-dates';

// styling
import styled from 'styled-components';

const Container = styled.div`
  display: inline-flex;
  position: relative;
  border-radius: 5px;
  background: #fff;
  border: solid 1px #ccc;

  .SingleDatePickerInput {
    outline: none;
    box-shadow: none;
    border: none;
    border-radius: none;
    background: transparent;

    .DateInput {
      background: transparent;

      .DateInput_fang {
        z-index: 1000 !important;
      }

      input {
        color: #333;
        /* font-family: 'visuelt', sans-serif !important; */
        font-size: 16px;
        font-weight: 400;
        outline: none;
        box-shadow: none;
        border: none;
        border-radius: 0;
        background: transparent;
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

interface Props {
  value: moment.Moment | null;
  onChange: (arg: moment.Moment | null) => void;
}

interface State {
  focused: boolean;
  selectedDate: moment.Moment | null;
}

export default class DateInput extends React.PureComponent<Props, State> {
  constructor (props: Props) {
    super(props);
    this.state = {
      focused: false,
      selectedDate: null,
    };
  }

  componentDidUpdate(prevProps: Props) {
    const oldIsoDate = (prevProps.value ? prevProps.value.format('YYYY-MM-DD') : null);
    const newIsoDate = (this.props.value ? this.props.value.format('YYYY-MM-DD') : null);

    if (oldIsoDate !== newIsoDate) {
      this.setState({ selectedDate: this.props.value });
    }
  }

  componentDidCatch(error) {
    console.log(error);
  }

  updateDateTime = (newMoment: moment.Moment | null) => {
    this.setState({ selectedDate: newMoment });
    this.props.onChange(newMoment);
  }

  handleDateChange = (newMoment: moment.Moment | null) => {
    this.updateDateTime(newMoment);
  }

  handleFocusChange = ({ focused }) => {
    this.setState({ focused });
  }

  isOutsideRange = () => false;

  render () {
    const className = this.props['className'];
    const { selectedDate, focused } = this.state;

    return (
      <Container className={className}>
        <SingleDatePicker
          id="singledatepicker"
          date={selectedDate}
          onDateChange={this.handleDateChange}
          focused={focused}
          onFocusChange={this.handleFocusChange}
          numberOfMonths={1}
          firstDayOfWeek={1}
          isOutsideRange={this.isOutsideRange}
          displayFormat="DD/MM/YYYY"
        />
      </Container>
    );
  }
}
