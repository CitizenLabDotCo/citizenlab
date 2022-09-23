import React, { PureComponent } from 'react';
import { Omit } from 'typings';

import { DateRangePicker, DateRangePickerShape } from 'react-dates';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// i18n
import { omit } from 'lodash-es';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import messages from './messages';

interface Props
  extends Omit<
    DateRangePickerShape,
    'focusedInput' | 'onFocusChange' | 'renderMonthText'
  > {
  className?: string;
}

interface State {
  focusedInput: 'startDate' | 'endDate' | null;
}

const StylingWrapper = styled.div`
  .DateRangePickerInput {
    border-radius: ${(props: any) => props.theme.borderRadius};
    border: solid 1px ${colors.border};

    &:hover {
      border-color: ${colors.hoveredBorder};
    }

    .DateInput,
    .DateInput_input {
      color: ${colors.text};
      font-size: ${fontSizes.base}px;
      line-height: normal;
      font-weight: 400;
      background: transparent;
    }
  }
`;

/** Light wrapper around react-dates DateRangePicker that autonomously deals with focusing and styling */
class OurDateRangePicker extends PureComponent<
  Props & WrappedComponentProps,
  State
> {
  constructor(props) {
    super(props);
    this.state = {
      focusedInput: null,
    };
  }

  handleFocusChange = (focusedInput: 'startDate' | 'endDate') => {
    this.setState({ focusedInput });
  };

  handleIsOutsideRange = () => {
    return false;
  };

  render() {
    return (
      <StylingWrapper className={this.props.className}>
        <DateRangePicker
          {...omit(this.props, 'intl')}
          startDateId="startAt"
          endDateId="endAt"
          focusedInput={this.state.focusedInput}
          onFocusChange={this.handleFocusChange}
          startDatePlaceholderText={this.props.intl.formatMessage(
            messages.startDatePlaceholder
          )}
          endDatePlaceholderText={this.props.intl.formatMessage(
            messages.endDatePlaceholder
          )}
          isOutsideRange={this.handleIsOutsideRange}
        />
      </StylingWrapper>
    );
  }
}

export default injectIntl(OurDateRangePicker);
