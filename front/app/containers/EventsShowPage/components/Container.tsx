import React from 'react';

// styling
import {
  contentFadeInDelay,
  contentFadeInDuration,
  contentFadeInEasing,
  pageContentMaxWidth,
} from '../styleConstants';
import styled from 'styled-components';

const Main = styled.main`
  width: 100%;
  max-width: ${pageContentMaxWidth}px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-left: auto;
  margin-right: auto;
  background: #fff;
  gap: 40px;

  &.loading {
    flex: 1;
    justify-content: center;
  }

  &.isLoaded {
    opacity: 0;

    &.content-enter {
      opacity: 0;

      &.content-enter-active {
        opacity: 1;
        transition: opacity ${contentFadeInDuration}ms ${contentFadeInEasing}
          ${contentFadeInDelay}ms;
      }
    }

    &.content-enter-done {
      opacity: 1;
    }
  }
`;

interface Props {
  children: React.ReactNode;
}

const Container = ({ children }: Props) => {
  return <Main>{children}</Main>;
};

export default Container;
