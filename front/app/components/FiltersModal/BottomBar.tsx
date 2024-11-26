import React, { memo, FormEvent } from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import Button from 'components/UI/Button';

interface Props {
  buttonText: string | JSX.Element;
  onClick: (event: FormEvent) => void;
}

const BottomBar = memo<Props>(({ buttonText, onClick }) => {
  return (
    <Box
      background={colors.white}
      p="16px"
      flex="1"
      borderTop={`1px solid ${colors.grey400}`}
    >
      <Button onClick={onClick} fullWidth={true}>
        {buttonText}
      </Button>
    </Box>
  );
});

export default BottomBar;
