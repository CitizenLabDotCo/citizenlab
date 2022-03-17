import React, { ReactNode, memo } from 'react';

// components
import Button from 'components/UI/Button';
import { Box } from '@citizenlab/cl2-component-library';

import styled from 'styled-components';

const HeaderText = styled.h1`
  font-size: 2rem;
`;

const HeaderContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

interface Props {
  onClickHandler: () => void;
  headerMessage: string;
  showHorizontalRule?: boolean;
  children?: ReactNode;
}

const TextingHeader = memo<Props>(
  ({ onClickHandler, headerMessage, showHorizontalRule, children }) => {
    return (
      <Box>
        <Button
          justify="left"
          onClick={onClickHandler}
          buttonStyle="text"
          icon="arrow-back"
          padding="0"
          size="2"
          text={'Go Back'}
        />
        <HeaderContainer>
          <HeaderText>{headerMessage}</HeaderText>
          {children}
        </HeaderContainer>
        {showHorizontalRule && <hr />}
      </Box>
    );
  }
);

export default TextingHeader;
