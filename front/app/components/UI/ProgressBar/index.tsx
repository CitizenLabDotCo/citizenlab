import React, { useState } from 'react';
import styled from 'styled-components';
import { clamp } from 'lodash-es';
import Observer from '@researchgate/react-intersection-observer';
import warningPattern from './warning_pattern.svg';

const Container = styled.div``;

const ProgressBarOuter = styled.div<{ background: string }>`
  width: 100%;
  height: 100%;
  border-radius: ${(props) => props.theme.borderRadius};
  background: ${(props) => props.background};
`;

const ProgressBarInner: any = styled.div<{ progress: number; color: string }>`
  width: 0px;
  height: 100%;
  border-radius: ${(props) => props.theme.borderRadius};
  background: ${(props) => props.color};
  transition: width 1000ms cubic-bezier(0.19, 1, 0.22, 1);
  will-change: width;

  &.visible {
    width: ${(props) => props.progress * 100}%;
  }
`;

interface Props {
  /** Number between 0 and 1 */
  progress: number;
  color: string;
  bgColor: string;
  /** Whether the background has a diagonal stripes pattern, defaults to false */
  bgShaded?: boolean;
  className?: string;
}

const ProgressBar = ({
  progress,
  color,
  bgColor,
  className,
  bgShaded,
}: Props) => {
  const [visible, setVisible] = useState(false);

  const handleIntersection = (
    event: IntersectionObserverEntry,
    unobserve: () => void
  ) => {
    if (event.isIntersecting) {
      setVisible(true);
      unobserve();
    }
  };

  return (
    <Container className={className} aria-hidden>
      <Observer onChange={handleIntersection}>
        <ProgressBarOuter
          background={bgShaded === true ? `url("${warningPattern}")` : bgColor}
        >
          <ProgressBarInner
            progress={clamp(progress, 0, 1)}
            className={visible ? 'visible' : ''}
            color={color}
          />
        </ProgressBarOuter>
      </Observer>
    </Container>
  );
};

export default ProgressBar;
