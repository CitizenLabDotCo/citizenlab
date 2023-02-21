import React from 'react';
import { Box, Text } from '@citizenlab/cl2-component-library';
import { FormattedNumbers } from 'components/admin/GraphCards/typings';
interface Props extends FormattedNumbers {
  title: string;
}

const getColor = (typeOfChange: FormattedNumbers['typeOfChange']) => {
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
