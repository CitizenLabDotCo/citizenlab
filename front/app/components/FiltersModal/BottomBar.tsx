import React, { FormEvent } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Button from 'components/UI/Button';

interface Props {
  buttonText: string | JSX.Element;
  onClick: (event: FormEvent) => void;
}

const BottomBar = ({ buttonText, onClick }: Props) => {
  return (
    <Box flex="1">
      <Button onClick={onClick} fullWidth={true}>
        {buttonText}
      </Button>
    </Box>
  );
};

export default BottomBar;
