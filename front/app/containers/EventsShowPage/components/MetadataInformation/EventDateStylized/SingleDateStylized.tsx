import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useLocale from 'hooks/useLocale';

import { showDotAfterDay } from 'utils/dateUtils';
import { isNilOrError } from 'utils/helperUtils';

type Props = {
  day: string;
  month: string;
  time: string;
};

const SingleDateStylized = ({ day, month, time }: Props) => {
  const locale = useLocale();
  const addDotAfterDay = !isNilOrError(locale) && showDotAfterDay(locale);

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Text
        m="0px"
        fontWeight="bold"
        style={{ fontSize: '34px', lineHeight: '1' }}
      >
        {day}
        {addDotAfterDay ? '.' : ''}
      </Text>
      <Text mt="0px" m="0px" fontWeight="normal" fontSize="m" color="grey700">
        {month}
      </Text>
      <Text m="0px" fontSize="l" fontWeight="semi-bold">
        {time}
      </Text>
    </Box>
  );
};

export default SingleDateStylized;
