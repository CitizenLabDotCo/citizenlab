import React, { useState } from 'react';
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
import { InjectedIntlProps } from 'react-intl';
import { omit } from 'lodash-es';

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
const OurDateRangePicker = (props: Props & InjectedIntlProps) => {
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
