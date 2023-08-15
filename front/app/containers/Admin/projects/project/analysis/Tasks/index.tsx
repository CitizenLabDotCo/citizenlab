import React, { useState } from 'react';
import useAnalysisBackgroundTasks from 'api/analysis_background_tasks/useAnalysisBackgroundTasks';
import { useParams } from 'react-router-dom';
import {
  Box,
  colors,
  IconButton,
  Dropdown,
  Button,
} from '@citizenlab/cl2-component-library';
import ProgressBar from 'components/UI/ProgressBar';
import styled from 'styled-components';

const StyledProgressBar = styled(ProgressBar)`
  height: 8px;
  width: 100%;
`;

const Tasks = () => {
  const { analysisId } = useParams() as { analysisId: string };
  const { data: tasks } = useAnalysisBackgroundTasks(analysisId);
  const [isDropdownOpened, setIsDropdownOpened] = useState(false);

  const anythingInProgress = tasks?.data.find(
    (t) =>
      t.attributes.state === 'in_progress' || t.attributes.state === 'queued'
  );

  return (
    <Box display="flex" w="32px" h="32px">
      {anythingInProgress ? (
        <Button
          processing={true}
          buttonStyle="text"
          width="24px"
          height="24px"
          aria-label="background jobs"
        />
      ) : (
        <IconButton
          iconName="book"
          a11y_buttonActionMessage="background jobs"
          iconColor={colors.primary}
          iconColorOnHover={colors.grey600}
          onClick={() => setIsDropdownOpened(!isDropdownOpened)}
          iconHeight="28px"
          iconWidth="28px"
        />
      )}

      <Dropdown
        opened={isDropdownOpened}
        onClickOutside={() => setIsDropdownOpened(false)}
        right="20px"
        top="60px"
        content={
          <>
            {tasks?.data.map((task) => {
              return (
                <Box p="24px" key={task.id}>
                  <div>{task.attributes.type}</div>
                  {task.attributes.type === 'auto_tagging_task' && (
                    <div>{task.attributes.auto_tagging_method}</div>
                  )}
                  {task.attributes.progress && (
                    <StyledProgressBar
                      progress={task.attributes.progress}
                      color={colors.green400}
                      bgColor={colors.grey100}
                    />
                  )}
                  <div>{task.attributes.state}</div>
                  <div>Triggered: {task.attributes.created_at}</div>
                  <div>Started: {task.attributes.started_at}</div>
                  <div>Ended: {task.attributes.ended_at}</div>
                </Box>
              );
            })}
          </>
        }
      />
    </Box>
  );
};

export default Tasks;
