import React, { useState } from 'react';
import { Omit } from 'typings';

import { DateRangePicker, DateRangePickerShape } from 'react-dates';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// i18n
import { omit } from 'lodash-es';
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

interface Props
  extends Omit<
    DateRangePickerShape,
    'focusedInput' | 'onFocusChange' | 'renderMonthText'
  > {
  className?: string;
}

const StylingWrapper = styled.div`
  .DateRangePickerInput {
    border-radius: ${(props: any) => props.theme.borderRadius};
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
const OurDateRangePicker = (props: Props & WrappedComponentProps) => {
  const [focusedInput, setFocusedInput] = useState<
    'startDate' | 'endDate' | null
  >(null);

  const handleFocusChange = (focusedInput: 'startDate' | 'endDate') => {
    setFocusedInput(focusedInput);
  };

  const handleIsOutsideRange = () => {
    return false;
  };

  return (
    <StylingWrapper className={props.className}>
      <DateRangePicker
        {...omit(props, 'intl')}
        startDateId="startAt"
        endDateId="endAt"
        focusedInput={focusedInput}
        onFocusChange={handleFocusChange}
        startDatePlaceholderText={props.intl.formatMessage(
          messages.startDatePlaceholder
        )}
        endDatePlaceholderText={props.intl.formatMessage(
          messages.endDatePlaceholder
        )}
        isOutsideRange={handleIsOutsideRange}
      />
    </StylingWrapper>
  );
};

export default injectIntl(OurDateRangePicker);
