import React from 'react';
import { Box, colors } from '@citizenlab/cl2-component-library';

interface Props {
  remainingChars: number;
  overCharacterLimit: boolean;
}

const RemainingCharacters = ({ remainingChars, overCharacterLimit }: Props) => {
  const getText = () => {
    if (overCharacterLimit) {
      // remainingChars is <=0 if overCharacterLimit is true
      return (
        <>
          {remainingChars * -1}{' '}
          {remainingChars === -1 ? 'character' : 'characters'} over the limit
        </>
      );
    } else {
      return (
        <>
          {remainingChars} {remainingChars === 1 ? 'character' : 'characters'}{' '}
          remaining
        </>
      );
    }
  };
  return (
    <Box color={overCharacterLimit ? colors.error : colors.textSecondary}>
      {getText()}
    </Box>
  );
};

export default RemainingCharacters;
