import React, { PureComponent } from 'react';
import { Omit } from 'typings';

import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import { DateRangePicker, DateRangePickerShape } from 'react-dates';

// styles
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import { omit } from 'lodash-es';

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
    border-radius: ${(props) => props.theme.borderRadius};
    border: solid 1px ${colors.borderDark};

    &:hover {
      border-color: ${colors.black};
    }

    .DateInput,
    .DateInput_input {
      color: ${colors.textPrimary};
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
  constructor(props: Props & WrappedComponentProps) {
    super(props);
    this.state = {
      focusedInput: null,
    };
  }

  handleFocusChange = (focusedInput: 'startDate' | 'endDate' | null) => {
    this.setState({ focusedInput });
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
        />
      </StylingWrapper>
    );
  }
}

export default injectIntl(OurDateRangePicker);
