import React, { useMemo, useState } from 'react';

import { Box, Icon, Text, Title, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import setupSections from './tasks';
import TaskRow from './TaskRow';

const ProgressTrack = styled.div`
  height: 8px;
  width: 100%;
  border-radius: 4px;
  background: ${colors.grey200};
  overflow: hidden;
`;

const ProgressFill = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${({ percentage }) => percentage}%;
  border-radius: 4px;
  background: ${colors.success};
  transition: width 200ms ease-out;
`;

const HeaderCard = styled(Box)`
  background: ${colors.teal50};
  border: 1px solid ${colors.teal100};
  border-radius: 4px;
  padding: 24px;
`;

const SetupTasks = () => {
  // Ticking a task only changes what you see on this page — nothing is stored.
  const [doneIds, setDoneIds] = useState<string[]>(() =>
    setupSections.flatMap((section) =>
      section.tasks.filter((task) => task.done).map((task) => task.id)
    )
  );

  const sections = useMemo(
    () =>
      setupSections.map((section) => ({
        ...section,
        tasks: section.tasks.map((task) => ({
          ...task,
          done: doneIds.includes(task.id),
        })),
      })),
    [doneIds]
  );

  const toggleTask = (taskId: string) => {
    setDoneIds((current) =>
      current.includes(taskId)
        ? current.filter((id) => id !== taskId)
        : [...current, taskId]
    );
  };

  const allTasks = sections.flatMap((section) => section.tasks);
  const doneCount = allTasks.filter((task) => task.done).length;
  const percentage = Math.round((doneCount / allTasks.length) * 100);
  const requiredLeft = allTasks.filter(
    (task) => task.required && !task.done
  ).length;
  const readyToLaunch = requiredLeft === 0;

  return (
    <Box width="100%" display="flex" justifyContent="center" pb="60px">
      <Box maxWidth="840px" width="100%">
        <Title color="primary" mb="8px">
          Set up your platform
        </Title>
        <Text color="textSecondary" mt="0" mb="24px">
          A short list of everything worth doing before you invite residents in.
          Work through it at your own pace — you can always come back.
        </Text>

        <HeaderCard mb="32px">
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap="16px"
            mb="12px"
          >
            <Text m="0" fontWeight="bold" color="primary">
              {doneCount} of {allTasks.length} done
            </Text>
            <Text m="0" fontSize="s" color="textSecondary">
              {readyToLaunch
                ? 'Everything required is taken care of — you are ready to go live.'
                : `${requiredLeft} required ${
                    requiredLeft === 1 ? 'task' : 'tasks'
                  } left before you can go live`}
            </Text>
          </Box>
          <ProgressTrack>
            <ProgressFill percentage={percentage} />
          </ProgressTrack>
        </HeaderCard>

        {sections.map((section) => {
          const sectionDone = section.tasks.every((task) => task.done);

          return (
            <Box key={section.id} mb="32px">
              <Box display="flex" alignItems="center" gap="8px">
                <Title variant="h3" color="primary" m="0">
                  {section.title}
                </Title>
                {sectionDone && (
                  <Icon
                    name="check-circle"
                    height="18px"
                    fill={colors.success}
                  />
                )}
              </Box>
              <Text color="textSecondary" fontSize="s" mt="2px" mb="12px">
                {section.subtitle}
              </Text>

              <Box display="flex" flexDirection="column" gap="8px">
                {section.tasks.map((task) => (
                  <TaskRow key={task.id} task={task} onToggle={toggleTask} />
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default SetupTasks;
