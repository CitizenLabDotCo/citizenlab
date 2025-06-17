import React, { useCallback } from 'react';

import {
  Box,
  Button,
  Text,
  defaultCardStyle,
  colors,
  useBreakpoint,
  Spinner,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useCommonGroundProgress from 'api/common_ground/useCommonGroundProgress';
import useReactToStatement from 'api/common_ground/useReactToStatement';
import useIdeaById from 'api/ideas/useIdeaById';

import { useSwipeToReact, SwipeDirection } from 'hooks/useSwipeToReact';

import T from 'components/T';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const BackdropCard = styled.div<{ $offset: number }>`
  ${defaultCardStyle};
  position: absolute;
  top: ${({ $offset }) => $offset * 8}px;
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
  $bgColor: string;
  $transform: string;
  $isAnimating: boolean;
  $isDragging: boolean;
}>`
  ${defaultCardStyle};
  min-height: 165px;
  position: relative;
  padding: 16px;
  background: ${({ $bgColor }) => $bgColor};
  box-shadow: ${({ $isDragging }) =>
    $isDragging
      ? '0px 8px 16px rgba(0, 0, 0, 0.12)'
      : '0px 2px 4px rgba(0, 0, 0, 0.08)'};
  border-radius: 4px;
  transform: ${({ $transform }) => $transform};
  transition: ${({ $isAnimating }) =>
    $isAnimating
      ? `transform 200ms cubic-bezier(0.2,0,0,1), background-color 0.2s, box-shadow 0.2s`
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
  $type: 'agree' | 'disagree' | 'unsure';
  $visible: boolean;
}>`
  position: absolute;
  padding: 8px 16px;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.2s;

  ${({ $type }) => {
    switch ($type) {
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
  const { data: progressData, isLoading: isProgressDataLoading } =
    useCommonGroundProgress(phaseId);
  const { mutate: reactToIdea } = useReactToStatement(phaseId);
  const { formatMessage } = useIntl();
  const isPhone = useBreakpoint('phone');

  const nextIdeaId = progressData?.data.relationships.next_idea.data?.id;
  const { data: current, isLoading: isIdeaLoading } = useIdeaById(nextIdeaId);

  const handleSwipe = useCallback(
    (direction: SwipeDirection) => {
      if (current) {
        reactToIdea({ ideaId: current.data.id, mode: direction });
      }
    },
    [current, reactToIdea]
  );

  const {
    dragOffset,
    swipeDirection,
    isAnimating,
    isDragging,
    bind,
    triggerSwipe,
  } = useSwipeToReact({ onSwipe: handleSwipe });

  if ((nextIdeaId && isIdeaLoading) || isProgressDataLoading) {
    return (
      <Box display="flex" justifyContent="center" p="20px">
        <Spinner />
      </Box>
    );
  }

  if (!current || !nextIdeaId) {
    return (
      <Box mt="8px" width="100%" minHeight="260px">
        <StatementCard
          $bgColor="white"
          $transform="translate3d(0px, 0px, 0)"
          $isAnimating={false}
          $isDragging={false}
          border={`1px solid ${colors.grey400}`}
          style={{ cursor: 'default' }}
        >
          <Box
            display="flex"
            p="10px 18px"
            justifyContent="center"
            alignItems="center"
            minHeight="100px"
          >
            <Text fontSize="l" color="grey800">
              {formatMessage(messages.noMoreStatements)}
            </Text>
          </Box>
        </StatementCard>
      </Box>
    );
  }

  const transform = `translate3d(${dragOffset.x}px, ${
    dragOffset.y
  }px, 0) rotate(${dragOffset.x * 0.05}deg)`;

  const bgColor = (() => {
    switch (swipeDirection) {
      case 'up':
        return `${colors.green500}15`;
      case 'down':
        return `${colors.red600}15`;
      case 'neutral':
        return `${colors.grey600}15`;
      default:
        return 'white';
    }
  })();

  return (
    <Box mt="8px" position="relative" width="100%" minHeight="260px">
      {[2, 1].map((i) => (
        <BackdropCard key={i} $offset={i} aria-hidden="true" />
      ))}

      <StatementCard
        $bgColor={bgColor}
        $transform={transform}
        $isAnimating={isAnimating}
        $isDragging={isDragging}
        border={`1px solid ${colors.grey400}`}
        {...bind}
      >
        <Box mb="12px" id={`statement-body-${current.data.id}`}>
          <Text fontSize="l">
            <T value={current.data.attributes.title_multiloc} supportHtml />
          </Text>
        </Box>

        <ActionIndicator $type="agree" $visible={swipeDirection === 'up'}>
          {formatMessage(messages.agreeLabel)}
        </ActionIndicator>
        <ActionIndicator $type="disagree" $visible={swipeDirection === 'down'}>
          {formatMessage(messages.disagreeLabel)}
        </ActionIndicator>
        <ActionIndicator $type="unsure" $visible={swipeDirection === 'neutral'}>
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
            onClick={() => triggerSwipe('up')}
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
            onClick={() => triggerSwipe('neutral')}
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
            onClick={() => triggerSwipe('down')}
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
