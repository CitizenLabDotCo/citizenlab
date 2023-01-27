import React from 'react';
import { Box, Text } from '@citizenlab/cl2-component-library';

interface Props {
  title: string;
  totalNumber: number | null;
  typeOfChange: 'increase' | 'decrease' | null;
  formattedSerieChange: string | null;
}

const getColor = (typeOfChange: 'increase' | 'decrease' | null) => {
  if (typeOfChange === 'increase') return 'success';
  if (typeOfChange === 'decrease') return 'red600';
  return undefined;
};

const Title = ({
  title,
  totalNumber,
  typeOfChange,
  formattedSerieChange,
}: Props) => (
  <>
    {title}
    <Box ml="10px" display="inline-flex" alignItems="center">
      <Text mt="0px" mb="0px" ml="5px" fontWeight="bold" display="inline">
        {totalNumber ?? ''}
      </Text>
      <Text
        mt="0px"
        mb="0px"
        fontSize="base"
        display="inline"
        color={getColor(typeOfChange)}
      >
        {formattedSerieChange ?? ''}
      </Text>
    </Box>
  </>
);

export default Title;
