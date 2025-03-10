import React, { useState } from 'react';

import { Box, Text, Button, colors } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

const QuarterlyDatePicker = () => {
  const { formatMessage } = useIntl();
  const [year, setYear] = useState(new Date().getFullYear());

  const currentQuarter = Math.floor(new Date().getMonth() / 3) + 1;
  const [quarter, setQuarter] = useState(currentQuarter);

  // Function to handle quarter navigation
  const changeQuarter = (direction: number) => {
    setQuarter((prevQuarter) => {
      // Calculates the next quarter based on the provided offset
      const newQuarter = prevQuarter + direction;
      // Crossing Q4 increments the year & resets to Q1
      if (newQuarter > 4) {
        setYear((prevYear) => prevYear + 1);
        return 1;
      }
      // Moving before Q1 decrements the year & sets quarter to Q4
      else if (newQuarter < 1) {
        setYear((prevYear) => prevYear - 1);
        return 4;
      }
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
