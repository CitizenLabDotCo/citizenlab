import React from 'react';
import { Box, colors } from '@citizenlab/cl2-component-library';

interface Props {
  remainingChars: number;
  overCharacterLimit: boolean;
}

const RemainingCharacters = ({ remainingChars, overCharacterLimit }: Props) => {
  const getText = () => {
    if (overCharacterLimit) {
      return <>{remainingChars * -1} characters over the limit</>;
    } else {
      return <>{remainingChars} characters remaining</>;
    }
  };
  return (
    <Box color={overCharacterLimit ? colors.clRed : colors.label}>
      {getText()}
    </Box>
  );
};

export default RemainingCharacters;
