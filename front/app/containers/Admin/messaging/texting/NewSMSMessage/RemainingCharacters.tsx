import React from 'react';
import { Box, colors } from '@citizenlab/cl2-component-library';

interface Props {
  remainingChars: number;
}

const RemainingCharacters = ({ remainingChars }: Props) => {
  const overCharacterLimit = remainingChars < 0;
  const getText = () => {
    if (overCharacterLimit) {
      return <>{remainingChars * -1} over the character limit</>;
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
