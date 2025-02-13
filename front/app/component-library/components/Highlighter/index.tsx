import React, { useEffect, useState } from 'react';

import { Box, colors, stylingConsts } from '@citizenlab/cl2-component-library';
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
  id: string;
}

const Highlighter = ({ id, children }: Props) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      const targetElementIdFromHash = window.location.hash.slice(1);
      const targetElement = document.getElementById(targetElementIdFromHash);

      if (targetElement && targetElementIdFromHash === id) {
        requestAnimationFrame(() => {
          scrollToElement({ id: targetElementIdFromHash });
          setAnimate(true);
          setTimeout(() => {
            setAnimate(false);
          }, 3000);
        });
      }
    };

    // Call the handler immediately to get the initial hash value
    handleHashChange();

    // Add event listener for hash change
    window.addEventListener('hashchange', handleHashChange);

    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [id]);

  return (
    <Container id={id} animate={animate}>
      {children}
    </Container>
  );
};

export default Highlighter;
export const createHighlightLink = (id: string, baseUrl: string) =>
  `${baseUrl}#${id}`;
