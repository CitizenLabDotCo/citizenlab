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
      <Box mr="5px" display="inline">
        {totalNumber ?? ''}
      </Box>
      <Text
        mt="0px"
        mb="0px"
        fontSize="base"
        display="inline"
        color={getColor(typeOfChange)}
        fontWeight="bold"
      >
        {formattedSerieChange ?? ''}
      </Text>
    </Box>
  </>
);

export default Title;
