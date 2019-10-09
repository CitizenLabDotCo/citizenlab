// must be at the top, before other imports!
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';

// libraries
import React, { PureComponent } from 'react';
import moment from 'moment';
import { SingleDatePicker } from 'react-dates';

// components
import Label from 'components/UI/Label';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

const Container = styled.div``;

const DateInputWrapper: any = styled.div`
  display: inline-flex;
  position: relative;
  border-radius: ${(props: any) => props.theme.borderRadius};
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
        z-index: 1000000 !important;
      }

      input {
        color: #333;
        font-size: ${fontSizes.base}px;
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
    left: ${(props: any) => props.openOnLeft ? '-150px' : '-1px'} !important;
  }
`;

const LabelWrapper = styled.div`
  display: flex;
`;

interface Props {
  id?: string | undefined;
  value: moment.Moment | null;
  label?: string | JSX.Element | null | undefined;
  onChange: (arg: moment.Moment | null) => void;
  openOnLeft?: boolean;
  className?: string;
}

interface State {
  focused: boolean;
  selectedDate: moment.Moment | null;
}

export default class DateInput extends PureComponent<Props, State> {
  constructor (props: Props) {
    super(props);
    this.state = {
      focused: false,
      selectedDate: this.props.value,
    };
  }

  componentDidUpdate(prevProps: Props) {
    const oldIsoDate = (prevProps.value ? prevProps.value.format('YYYY-MM-DD') : null);
    const newIsoDate = (this.props.value ? this.props.value.format('YYYY-MM-DD') : null);

    if (oldIsoDate !== newIsoDate) {
      this.setState({ selectedDate: this.props.value });
    }
  }

  updateDateTime = (newMoment: moment.Moment | null) => {
    this.setState({ selectedDate: newMoment });
    this.props.onChange(newMoment);
  }

  handleDateChange = (newMoment: moment.Moment | null) => {
    this.updateDateTime(newMoment);
  }

  handleFocusChange = ({ focused }: { focused: boolean }) => {
    this.setState({ focused });
  }

  isOutsideRange = () => false;

  render () {
    const { id, label, openOnLeft, className } = this.props;
    const { selectedDate, focused } = this.state;

    return (
      <Container className={className}>
        {label &&
          <LabelWrapper>
            <Label htmlFor={id}>{label}</Label>
          </LabelWrapper>
        }

        <DateInputWrapper openOnLeft={openOnLeft}>
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
        </DateInputWrapper>
      </Container>
    );
  }
}
