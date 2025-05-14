import React, { useState, useRef } from 'react';

import {
  Box,
  Button,
  Text,
  defaultCardStyle,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useCommonGroundProgress from 'api/common_ground/useCommonGroundProgress';
import useReactToStatement from 'api/common_ground/useReactToStatement';

import T from 'components/T';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const SWIPE_THRESHOLD = 100;
const ANIMATION_DURATION = 200; // ms

const BackdropCard = styled.div<{ offset: number }>`
  ${defaultCardStyle};
  position: absolute;
  top: ${({ offset }) => offset * 8}px;
  left: 0;
  right: 0;
  width: 96%;
  height: 60%;
  margin: 0 auto;
  background: white;
  z-index: 1;
  pointer-events: none;
  user-select: none;
  border-radius: 4px;
`;

const StatementCard = styled(Box)<{
  bgColor: string;
  transform: string;
  isAnimating: boolean;
  isDragging: boolean;
}>`
  ${defaultCardStyle};
  position: relative;
  padding: 16px;
  background: ${({ bgColor }) => bgColor};
  box-shadow: ${({ isDragging }) =>
    isDragging
      ? '0px 8px 16px rgba(0, 0, 0, 0.12)'
      : '0px 2px 4px rgba(0, 0, 0, 0.08)'};
  border-radius: 4px;
  transform: ${({ transform }) => transform};
  transition: ${({ isAnimating }) =>
    isAnimating
      ? `transform ${ANIMATION_DURATION}ms cubic-bezier(0.2,0,0,1), background-color 0.2s, box-shadow 0.2s`
      : 'box-shadow 0.2s'};
  touch-action: none;
  user-select: none;
  cursor: grab;
  will-change: transform;
  z-index: 2;

  &:active {
    cursor: grabbing;
    box-shadow: 0px 12px 24px rgba(0, 0, 0, 0.16);
  }
`;

const ActionIndicator = styled(Box)<{
  type: 'agree' | 'disagree' | 'unsure';
  visible: boolean;
}>`
  position: absolute;
  padding: 8px 16px;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  opacity: ${({ visible }) => (visible ? 1 : 0)};
  transition: opacity 0.2s;

  ${({ type }) => {
    switch (type) {
      case 'agree':
        return `
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          background-color: ${colors.green500};
        `;
      case 'disagree':
        return `
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          background-color: ${colors.red600};
        `;
      case 'unsure':
        return `
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background-color: ${colors.grey600};
        `;
    }
  }}
`;

interface Props {
  phaseId: string;
}

const CommonGroundStatements = ({ phaseId }: Props) => {
  const { data: progressData } = useCommonGroundProgress(phaseId);
  const { mutate: reactToIdea } = useReactToStatement(phaseId);
  const current = progressData?.data.attributes.nextIdea;
  const { formatMessage } = useIntl();
  const isPhone = useBreakpoint('phone');

  // swipe state
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const startRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  if (!current) {
    return <Box mt="24px">{formatMessage(messages.noMoreStatements)}</Box>;
  }

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // If user clicked a button, let the button handle it instead of starting a swipe
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    e.currentTarget.setPointerCapture(e.pointerId);
    startRef.current = { x: e.clientX, y: e.clientY };
    setIsAnimating(false);
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    setDragOffset({ x: dx, y: dy });
  };

  const snapBack = () => {
    setIsAnimating(true);
    setDragOffset({ x: 0, y: 0 });
    setTimeout(() => setIsAnimating(false), ANIMATION_DURATION);
  };

  const snapOffAndReact = (mode: 'agree' | 'disagree' | 'unsure') => {
    const endX =
      mode === 'agree'
        ? -window.innerWidth
        : mode === 'disagree'
        ? window.innerWidth
        : 0;
    const endY = mode === 'unsure' ? -window.innerHeight : dragOffset.y;

    setIsAnimating(true);
    setDragOffset({ x: endX, y: endY });

    setTimeout(() => {
      reactToIdea({ ideaId: current.id, mode });
      // reset
      setIsAnimating(false);
      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
    }, ANIMATION_DURATION);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    e.currentTarget.releasePointerCapture(e.pointerId);

    const { x, y } = dragOffset;
    const absX = Math.abs(x);
    const absY = Math.abs(y);

    setIsDragging(false);

    if (absX > absY && absX > SWIPE_THRESHOLD) {
      snapOffAndReact(x < 0 ? 'agree' : 'disagree');
    } else if (absY > absX && -y > SWIPE_THRESHOLD) {
      snapOffAndReact('unsure');
    } else {
      snapBack();
    }
  };

  const bgColor = (() => {
    const { x, y } = dragOffset;
    const absX = Math.abs(x);
    const absY = Math.abs(y);

    if (absX > absY && absX > 50) {
      return x < 0 ? `${colors.green500}15` : `${colors.red600}15`;
    } else if (absY > absX && y < -50) {
      return `${colors.grey600}15`;
    }
    return 'white';
  })();

  return (
    <Box mt="8px" position="relative" width="100%" minHeight="260px">
      {[2, 1].map((i) => (
        <BackdropCard key={i} offset={i} aria-hidden="true" />
      ))}

      <StatementCard
        bgColor={bgColor}
        transform={`translate3d(${dragOffset.x}px, ${
          dragOffset.y
        }px, 0) rotate(${dragOffset.x * 0.05}deg)`}
        isAnimating={isAnimating}
        isDragging={isDragging}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        border={`1px solid ${colors.grey400}`}
      >
        <Box mb="12px" id={`statement-body-${current.id}`}>
          <Text fontSize="l">
            <T value={current.body} supportHtml />
          </Text>
        </Box>

        <ActionIndicator type="agree" visible={dragOffset.x < -50}>
          {formatMessage(messages.agreeLabel)}
        </ActionIndicator>
        <ActionIndicator type="disagree" visible={dragOffset.x > 50}>
          {formatMessage(messages.disagreeLabel)}
        </ActionIndicator>
        <ActionIndicator type="unsure" visible={dragOffset.y < -50}>
          {formatMessage(messages.unsureLabel)}
        </ActionIndicator>

        <Box
          display="flex"
          w="100%"
          justifyContent="space-between"
          gap="8px"
          flexDirection={isPhone ? 'column' : 'row'}
        >
          <Button
            buttonStyle="secondary-outlined"
            icon="check-circle"
            iconColor={colors.green500}
            justify={isPhone ? 'left' : 'center'}
            textColor={colors.textPrimary}
            onClick={() => reactToIdea({ ideaId: current.id, mode: 'agree' })}
            whiteSpace="normal"
            fullWidth
          >
            {formatMessage(messages.agreeLabel)}
          </Button>
          <Button
            buttonStyle="secondary-outlined"
            icon="sentiment-neutral"
            iconColor={colors.grey700}
            justify={isPhone ? 'left' : 'center'}
            textColor={colors.textPrimary}
            whiteSpace="normal"
            onClick={() => reactToIdea({ ideaId: current.id, mode: 'unsure' })}
            fullWidth
          >
            {formatMessage(messages.unsureLabel)}
          </Button>
          <Button
            buttonStyle="secondary-outlined"
            icon="cancel"
            iconColor={colors.red600}
            justify={isPhone ? 'left' : 'center'}
            textColor={colors.textPrimary}
            whiteSpace="normal"
            onClick={() =>
              reactToIdea({ ideaId: current.id, mode: 'disagree' })
            }
            fullWidth
          >
            {formatMessage(messages.disagreeLabel)}
          </Button>
        </Box>
      </StatementCard>
    </Box>
  );
};

export default CommonGroundStatements;
