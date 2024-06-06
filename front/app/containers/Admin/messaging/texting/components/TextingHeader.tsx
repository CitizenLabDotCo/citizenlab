import React, { ReactNode } from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import Button from 'components/UI/Button';

interface Props {
  onClickGoBack: () => void;
  headerMessage: string;
  showHorizontalRule?: boolean;
  children?: ReactNode;
}

const TextingHeader = ({
  onClickGoBack,
  headerMessage,
  showHorizontalRule,
  children,
}: Props) => {
  return (
    <Box marginBottom="10px">
      <Button
        justify="left"
        onClick={onClickGoBack}
        buttonStyle="text"
        icon="arrow-left"
        padding="0"
        size="m"
        mb="2rem"
        text={'Go back'}
      />
      <Box
        height="100%"
        width="100%"
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Title styleVariant="h1" margin="0">
          {headerMessage}
        </Title>
        {children}
      </Box>
      {showHorizontalRule && <hr />}
    </Box>
  );
};

export default TextingHeader;
