import React, { useState } from 'react';

import { Box, colors, Icon, Text } from '@citizenlab/cl2-component-library';
import { useDrop } from 'react-dnd';
import styled, { keyframes } from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import { DND_QUESTION, DragItem, useBuilder } from '../context';
import messages from '../messages';

// Every few seconds the add-lines briefly light up, one after the other from
// top to bottom, as a hint that questions can be added between questions.
// Otherwise they stay invisible until hovered.
const GLOW_CYCLE_SECONDS = 7;
const GLOW_STAGGER_MS = 120;

const glow = keyframes`
  0%, 76%, 100% { opacity: 0; }
  84% { opacity: 0.6; }
`;

// Box can't do keyframe animations, hence a styled component. It fades the
// whole add-line (line and "Add question" pill) in and out.
const Glow = styled.div<{ delayMs: number }>`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  animation: ${glow} ${GLOW_CYCLE_SECONDS}s ease-in-out infinite;
  animation-delay: ${({ delayMs }) => delayMs}ms;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

// The line with the "Add question" pill in the middle.
const AddLine = ({ label }: { label: string }) => (
  <>
    <Box
      position="absolute"
      left="16px"
      right="16px"
      top="50%"
      h="2px"
      bgColor={colors.teal400}
      borderRadius="2px"
      style={{ transform: 'translateY(-50%)' }}
    />
    <Box
      position="relative"
      display="flex"
      alignItems="center"
      gap="4px"
      px="10px"
      h="22px"
      borderRadius="11px"
      bgColor={colors.teal400}
    >
      <Icon name="plus" width="14px" height="14px" fill={colors.white} />
      <Text m="0px" fontSize="xs" fontWeight="bold" color="white">
        {label}
      </Text>
    </Box>
  </>
);

type Props = {
  pageId: string;
  index: number;
  isDraggingQuestion: boolean;
};

// Sits in the gap between two questions (the gap is the bottom margin of the
// question above, so the preview spacing stays exactly as participants see
// it). The whole line is a button that adds a question in that spot; while
// dragging, it shows where the question will land.
const InsertionPoint = ({ pageId, index, isDraggingQuestion }: Props) => {
  const [active, setActive] = useState(false);
  const { formatMessage } = useIntl();
  const { dropTarget, setDropTarget, openAddModal } = useBuilder();

  const [, drop] = useDrop<DragItem>({
    accept: DND_QUESTION,
    hover: () => setDropTarget({ pageId, index }),
  });

  const isActiveDropTarget =
    isDraggingQuestion &&
    dropTarget?.pageId === pageId &&
    dropTarget.index === index;
  const showAddLine = active && !isDraggingQuestion;

  return (
    <Box position="relative" h="0px">
      <Box
        ref={drop}
        as="button"
        type="button"
        aria-label={formatMessage(messages.addQuestion)}
        position="absolute"
        top="-24px"
        left="-16px"
        right="-16px"
        h="24px"
        p="0px"
        zIndex="2"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgColor="transparent"
        border="none"
        style={{ cursor: 'pointer' }}
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        onClick={(event) => {
          event.stopPropagation();
          openAddModal({ pageId, index });
        }}
        data-cy="e2e-form-builder-new-insertion-point"
      >
        {!showAddLine && !isDraggingQuestion && (
          <Glow delayMs={index * GLOW_STAGGER_MS}>
            <AddLine label={formatMessage(messages.addQuestion)} />
          </Glow>
        )}
        {showAddLine && <AddLine label={formatMessage(messages.addQuestion)} />}
        {isActiveDropTarget && (
          <Box
            position="absolute"
            left="16px"
            right="16px"
            top="50%"
            h="3px"
            bgColor={colors.primary}
            borderRadius="2px"
            style={{ transform: 'translateY(-50%)' }}
          />
        )}
      </Box>
    </Box>
  );
};

export default InsertionPoint;
