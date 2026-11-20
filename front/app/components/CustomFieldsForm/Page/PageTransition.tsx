import React, { useEffect, useRef, useState } from 'react';

import styled, { css, keyframes } from 'styled-components';

export type PageDirection = 'forward' | 'back';

// The direction of the last page change, for a component that stays mounted
// across pages. It compares with the index of the previous render.
export const usePageDirection = (pageIndex: number): PageDirection => {
  const previousIndex = useRef(pageIndex);
  const direction: PageDirection =
    pageIndex >= previousIndex.current ? 'forward' : 'back';
  useEffect(() => {
    previousIndex.current = pageIndex;
  }, [pageIndex]);
  return direction;
};

const OFFSET_PX = 32;

const slideIn = (fromPx: number) => keyframes`
  from {
    opacity: 0;
    transform: translateX(${fromPx}px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// Box can't do keyframe animations, hence a styled component.
const Container = styled.div<{ direction: PageDirection }>`
  ${({ direction }) => css`
    animation: ${slideIn(direction === 'forward' ? OFFSET_PX : -OFFSET_PX)}
      260ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  `}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const isScrollable = (element: HTMLElement) => {
  const { overflowY } = window.getComputedStyle(element);
  return overflowY === 'auto' || overflowY === 'scroll';
};

// Scrolls whatever scrolls this page (the form page, or the window) back up.
const scrollToTop = (element: HTMLElement | null) => {
  let parent = element?.parentElement ?? null;
  while (parent && !isScrollable(parent)) {
    parent = parent.parentElement;
  }
  if (parent) {
    parent.scrollTo({ top: 0 });
  } else {
    window.scrollTo({ top: 0 });
  }
};

type Props = {
  direction: PageDirection;
  children: React.ReactNode;
};

// Wraps the content of one form page: when a new page shows up (this mounts),
// it scrolls back to the top and slides in from the side it came from.
// Give it a `key` per page so it remounts on every page change.
const PageTransition = ({ direction, children }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  // Fixed at mount: a later change must not replay the animation.
  const [initialDirection] = useState(direction);

  useEffect(() => {
    scrollToTop(ref.current);
  }, []);

  return (
    <Container ref={ref} direction={initialDirection}>
      {children}
    </Container>
  );
};

export default PageTransition;
