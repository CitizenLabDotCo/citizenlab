import React from 'react';

import styled from 'styled-components';

import { colors } from '../../utils/styleUtils';

const Track = styled.div<{ height: string }>`
  width: 100%;
  height: ${(props) => props.height};
  background-color: ${colors.grey200};
  border-radius: 4px;
  overflow: hidden;
`;

const Fill = styled.div<{ progress: number; color: string }>`
  height: 100%;
  width: ${(props) => props.progress}%;
  background-color: ${(props) => props.color};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

interface Props {
  progress: number;
  height?: string;
  color?: string;
  className?: string;
}

const ProgressBar = ({
  progress,
  height = '8px',
  color = colors.teal,
  className,
}: Props) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <Track height={height} className={className}>
      <Fill progress={clampedProgress} color={color} />
    </Track>
  );
};

export default ProgressBar;
