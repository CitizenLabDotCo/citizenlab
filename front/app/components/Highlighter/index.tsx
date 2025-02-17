import React, { useEffect, useState } from 'react';

import { Box, colors, stylingConsts } from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router-dom';
import { RouteType } from 'routes';
import styled, { keyframes, css } from 'styled-components';

import { scrollToElement } from 'utils/scroll';

const highlightAnimation = keyframes`
  0% {
    background-color: transparent;
  }
  50% {
    background-color: ${colors.teal100};
  }
  100% {
    background-color: transparent;
  }
`;

const Container = styled(Box)<{ animate?: boolean }>`
  border-radius: ${stylingConsts.borderRadius};

  ${({ animate }) =>
    animate &&
    css`
      animation: ${highlightAnimation} 3s ease-in-out;
    `};
`;

interface Props {
  children: React.ReactNode;
  // The part after the hash sign (#) in a URL is called the fragment identifier (or just fragment).
  fragmentId: string;
}

const Highlighter = ({ fragmentId, children }: Props) => {
  const [animate, setAnimate] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleHashChange = () => {
      const locationFragmentId = location.hash.slice(1);

      if (locationFragmentId === fragmentId) {
        // We ensure id is on the element via Container below.
        scrollToElement({ id: locationFragmentId });
        setAnimate(true);
        setTimeout(() => {
          setAnimate(false);
        }, 3000);
      }
    };

    const timeout = setTimeout(handleHashChange, 100); // Small delay for hydration issues

    return () => {
      clearTimeout(timeout);
    };
  }, [fragmentId, location.hash]);

  return (
    <Container id={fragmentId} animate={animate}>
      {children}
    </Container>
  );
};

export default Highlighter;
// The purpose of createHighlighterLink is to easily locate
// links used in conjunction with Highlighter in the codebase.
export const createHighlighterLink = (path: RouteType) => path;
