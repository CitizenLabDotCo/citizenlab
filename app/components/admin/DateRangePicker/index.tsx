import React, { PureComponent } from 'react';
import { Omit } from 'typings';

import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import { DateRangePicker, DateRangePickerShape } from 'react-dates';

import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

interface Props extends Omit<DateRangePickerShape, 'focusedInput' | 'onFocusChange'> {
  className?: string;
}

interface State {
  focusedInput: 'startDate' | 'endDate' | null;
}

const StylingWrapper = styled.div`
  .DateRangePickerInput {
    border-radius: 5px;

    svg {
      z-index: 3;
    }

    .DateInput,
    .DateInput_input {
      color: inherit;
      font-size: ${fontSizes.base}px;
      font-weight: 400;
      background: transparent;
    }
  }
`;

/** Light wrapper around react-dates DateRangePicker that autonomously deals with focusing and styling */
class OurDateRangePicker extends PureComponent<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      focusedInput: null,
    };
  }

  handleFocusChange = (focusedInput: 'startDate' | 'endDate') => {
    this.setState({ focusedInput });
  }

  render() {
    return (
      <StylingWrapper className={this.props.className}>
        <DateRangePicker
          startDateId="startAt"
          endDateId="endAt"
          focusedInput={this.state.focusedInput}
          onFocusChange={this.handleFocusChange}
          {...this.props}
        />
      </StylingWrapper>
    );
  }
}

export default OurDateRangePicker;
