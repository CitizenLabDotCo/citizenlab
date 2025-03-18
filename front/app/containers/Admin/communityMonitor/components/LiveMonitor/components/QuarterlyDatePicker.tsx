import React, { useState } from 'react';

import { Box, Text, Button, colors } from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

const QuarterlyDatePicker = () => {
  const { formatMessage } = useIntl();
  const [search, setSearchParams] = useSearchParams();

  // Check if initial year and quarter set in URL
  const initialYear = search.get('year');
  const initialQuarter = search.get('quarter');

  // Initialize year and quarter state
  const [year, setYear] = useState(
    initialYear ? parseInt(initialYear, 10) : new Date().getFullYear()
  );

  const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;
  const [quarter, setQuarter] = useState(
    initialQuarter ? parseInt(initialQuarter, 10) : currentQuarter
  );

  // Function to handle quarter navigation
  const changeQuarter = (direction: number) => {
    setQuarter((prevQuarter) => {
      // Calculates the next quarter based on the provided direction (+1 or -1)
      const newQuarter = prevQuarter + direction;

      // Crossing Q4 increments the year & resets to Q1
      if (newQuarter > 4) {
        setYear((prevYear) => prevYear + 1);
        setSearchParams({ year: (year + 1).toString(), quarter: '1' });
        return 1;
      }
      // Moving before Q1 decrements the year & sets quarter to Q4
      else if (newQuarter < 1) {
        setYear((prevYear) => prevYear - 1);
        setSearchParams({ year: (year - 1).toString(), quarter: '4' });
        return 4;
      }

      // Otherwise, just update the quarter
      setSearchParams({
        year: year.toString(),
        quarter: newQuarter.toString(),
      });

      return newQuarter;
    });
  };

  return (
    <Box display="flex" gap="4px" alignItems="center">
      <Button
        buttonStyle="secondary"
        px="8px"
        py="4px"
        iconSize="20px"
        icon="arrow-left"
        onClick={() => changeQuarter(-1)}
      />
      <Box
        border={`1px solid ${colors.coolGrey500}`}
        borderRadius="3px"
        px="8px"
        py="4px"
        background={colors.white}
      >
        <Text m="0px" fontSize="s">
          {formatMessage(messages.quarterYearCondensed, {
            quarterNumber: quarter,
            year,
          })}
        </Text>
      </Box>
      <Button
        buttonStyle="secondary"
        px="8px"
        py="4px"
        iconSize="20px"
        icon="arrow-right"
        onClick={() => changeQuarter(1)}
      />
    </Box>
  );
};

export default QuarterlyDatePicker;
