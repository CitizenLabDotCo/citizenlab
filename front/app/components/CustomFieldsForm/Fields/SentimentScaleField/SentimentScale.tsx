import React, { useRef, useEffect, useCallback } from 'react';

import { Box, Table } from '@citizenlab/cl2-component-library';

import { IFlatCustomField } from 'api/custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import { MINIMUM, MAXIMUM } from './constants';
import TableBody from './TableBody';
import TableHead from './TableHead';
import { getAriaValueText, handleKeyboardKeyChange } from './utils';

interface Props {
  value?: number;
  question: IFlatCustomField;
  onChange: (value?: number) => void;
}

const SentimentScale = ({ value: data, question, onChange }: Props) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const id = question.key;

  // Get the aria-label for the slider
  const getAriaLabel = useCallback(
    (value: number, total: number) => {
      return getAriaValueText({
        value,
        total,
        question,
        formatMessage,
        localize,
      });
    },
    [question, formatMessage, localize]
  );

  // Set the aria-valuenow and aria-valuetext attributes on the slider when the data changes
  useEffect(() => {
    if (sliderRef.current) {
      sliderRef.current.setAttribute('aria-valuenow', String(data || MINIMUM));
      sliderRef.current.setAttribute(
        'aria-valuetext',
        getAriaLabel(data || MINIMUM, MAXIMUM)
      );
    }
  }, [data, getAriaLabel]);

  // Handle keyboard input for the slider
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const value = data || MINIMUM;
    let newValue = value;
    newValue = handleKeyboardKeyChange(event, value);

    onChange(newValue);
    if (sliderRef.current) {
      sliderRef.current.setAttribute('aria-valuenow', String(newValue));
      sliderRef.current.setAttribute(
        'aria-valuetext',
        getAriaLabel(newValue, 5)
      );
    }
    event.preventDefault();
  };

  return (
    <Box
      data-testid="sentimentLinearScaleControl"
      role="slider"
      ref={sliderRef}
      aria-valuemin={MINIMUM}
      aria-valuemax={MAXIMUM}
      aria-labelledby={id}
      onKeyDown={(event) => {
        if (event.key !== 'Tab' && !event.metaKey) {
          // Don't override the default tab behaviour or meta key (E.g. Mac command key)
          handleKeyDown(event);
        }
      }}
      tabIndex={0}
    >
      <Box>
        <Table style={{ tableLayout: 'fixed' }}>
          <TableHead
            data={data}
            id={id}
            getAriaLabel={getAriaLabel}
            onChange={onChange}
            onFocusSliderRef={() => {
              sliderRef.current?.focus();
            }}
          />
          <TableBody question={question} getAriaLabel={getAriaLabel} />
        </Table>
      </Box>
    </Box>
  );
};

export default SentimentScale;
