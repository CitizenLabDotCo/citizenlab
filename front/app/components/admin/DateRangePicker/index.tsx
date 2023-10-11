import React, { useState } from 'react';
import { Omit } from 'typings';

import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import { DateRangePicker, DateRangePickerShape } from 'react-dates';
// import DatePicker from 'react-datepicker';

// styles
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';
import { omit } from 'lodash-es';
import { Moment } from 'moment';

interface Props
  extends Omit<
    DateRangePickerShape,
    'focusedInput' | 'onFocusChange' | 'renderMonthText'
  > {
  isOutsideRange?: ((day: Moment) => boolean) | undefined;
  className?: string;
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
const OurDateRangePicker = (props: Props) => {
  const { formatMessage } = useIntl();
  const [focusedInput, setFocusedInput] = useState<
    'startDate' | 'endDate' | null
  >(null);

  const handleFocusChange = (focusedInput: 'startDate' | 'endDate' | null) => {
    setFocusedInput(focusedInput);
  };

  const handleIsOutsideRange = (day: Moment) => {
    if (props.isOutsideRange) {
      return props.isOutsideRange(day);
    }
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
        startDatePlaceholderText={formatMessage(messages.startDatePlaceholder)}
        endDatePlaceholderText={formatMessage(messages.endDatePlaceholder)}
        isOutsideRange={handleIsOutsideRange}
      />
    </StylingWrapper>
  );
};

export default OurDateRangePicker;
