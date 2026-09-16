import React from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { SetupTask } from './tasks';

const Row = styled(Box)<{ done: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 4px;
  background: ${({ done }) => (done ? colors.grey50 : colors.white)};
  border: 1px solid ${colors.divider};
  transition: box-shadow 120ms ease-out;

  &:hover {
    box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.12);
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin-top: 2px;
  cursor: pointer;
  display: flex;
`;

const RequiredTag = styled.span`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: ${colors.orange500};
  background: ${colors.orange100};
  border-radius: 3px;
  padding: 2px 6px;
`;

type Props = {
  task: SetupTask;
  onToggle: (taskId: string) => void;
};

const TaskRow = ({ task, onToggle }: Props) => (
  <Row done={task.done}>
    <ToggleButton
      type="button"
      onClick={() => onToggle(task.id)}
      aria-label={task.done ? 'Mark as not done' : 'Mark as done'}
    >
      <Icon
        name={task.done ? 'check-circle' : 'dotted-circle'}
        height="22px"
        fill={task.done ? colors.success : colors.grey500}
      />
    </ToggleButton>

    <Box flex="1" minWidth="0">
      <Box display="flex" alignItems="center" gap="8px" flexWrap="wrap">
        <Text
          m="0"
          fontWeight="bold"
          color={task.done ? 'textSecondary' : 'textPrimary'}
          style={task.done ? { textDecoration: 'line-through' } : undefined}
        >
          {task.title}
        </Text>
        {task.required && !task.done && <RequiredTag>Required</RequiredTag>}
      </Box>
      <Text m="0" mt="2px" fontSize="s" color="textSecondary">
        {task.description}
      </Text>
    </Box>

    <Box
      display="flex"
      alignItems="center"
      gap="12px"
      flex="0 0 auto"
      ml="8px"
      mt="2px"
    >
      <Box display="flex" alignItems="center" gap="4px">
        <Icon name="clock" height="14px" fill={colors.textSecondary} />
        <Text m="0" fontSize="xs" color="textSecondary">
          {task.duration}
        </Text>
      </Box>
      <ButtonWithLink
        linkTo={task.link}
        buttonStyle={task.done ? 'secondary-outlined' : 'primary'}
        size="s"
        icon="chevron-right"
        iconPos="right"
      >
        {task.done ? 'Review' : 'Set up'}
      </ButtonWithLink>
    </Box>
  </Row>
);

export default TaskRow;
