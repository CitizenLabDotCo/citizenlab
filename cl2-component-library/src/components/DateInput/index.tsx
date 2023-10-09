// must be at the top, before other imports!
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';

// libraries
import React, { PureComponent } from 'react';
import { Moment } from 'moment';
import { SingleDatePicker } from 'react-dates';

// components
import Label from '../Label';

// styling
import styled from 'styled-components';
import { fontSizes, colors } from '../../utils/styleUtils';
import testEnv from '../../utils/testUtils/testEnv';

const Container = styled.div``;

const DateInputWrapper = styled.div<{ openOnLeft: boolean | undefined }>`
  width: 100%;
  display: inline-flex;
  position: relative;
  border-radius: ${(props) => props.theme.borderRadius};
  background: #fff;
  border: solid 1px ${colors.borderDark};

  & .SingleDatePicker {
    width: 100%;
  }

  .SingleDatePickerInput {
    width: 100%;
    outline: none;
    box-shadow: none;
    border: none;
    border-radius: none;
    background: transparent;

    .DateInput {
      width: 100%;
      background: transparent;

      .DateInput_fang {
        z-index: 1000000 !important;
      }

      input {
        width: 100%;
        color: #333;
        font-size: ${fontSizes.base}px;
        font-weight: 400;
        outline: none;
        box-shadow: none;
        border: none;
        border-radius: 0;
        background: transparent;
        border-bottom: solid 3px transparent;

        &.DateInput_input__focused {
          border-bottom: solid 3px #00a699;
        }
      }
    }
  }

  .SingleDatePicker_picker {
    left: ${(props) => (props.openOnLeft ? '-150px' : '-1px')} !important;
  }
`;

const LabelWrapper = styled.div`
  display: flex;
`;

interface Props {
  id?: string | undefined;
  value: Moment | null;
  label?: string | JSX.Element | null | undefined;
  onChange: (arg: Moment | null) => void;
  openOnLeft?: boolean;
  className?: string;
  disabled?: boolean;
}

interface State {
  focused: boolean;
  selectedDate: Moment | null;
}

class DateInput extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      focused: false,
      selectedDate: props.value,
    };
  }

  componentDidUpdate(prevProps: Props) {
    const oldIsoDate = prevProps.value
      ? prevProps.value.format('YYYY-MM-DD')
      : null;
    const newIsoDate = this.props.value
      ? this.props.value.format('YYYY-MM-DD')
      : null;

    if (oldIsoDate !== newIsoDate) {
      this.setState({ selectedDate: this.props.value });
    }
  }

  updateDateTime = (newMoment: Moment | null) => {
    this.setState({ selectedDate: newMoment });
    this.props.onChange(newMoment);
  };

  handleDateChange = (newMoment: Moment | null) => {
    this.updateDateTime(newMoment);
  };

  handleFocusChange = ({ focused }: { focused: boolean | null }) => {
    this.setState({ focused: !!focused });
  };

  isOutsideRange = () => false;

  render() {
    const { id, label, openOnLeft, className, disabled } = this.props;
    const { selectedDate, focused } = this.state;

    return (
      <Container className={className}>
        {label && (
          <LabelWrapper>
            <Label htmlFor={id}>{label}</Label>
          </LabelWrapper>
        )}

        <DateInputWrapper
          openOnLeft={openOnLeft}
          data-testid={testEnv('wrapper')}
        >
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
            disabled={disabled}
          />
        </DateInputWrapper>
      </Container>
    );
  }
}

export default DateInput;
