import React from 'react';
import useAnalysisBackgroundTasks from 'api/analysis_background_tasks/useAnalysisBackgroundTasks';
import { useParams } from 'react-router-dom';
import {
  Accordion,
  Box,
  Spinner,
  colors,
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

  const anythingInProgress = tasks?.data.find(
    (t) =>
      t.attributes.state === 'in_progress' || t.attributes.state === 'queued'
  );

  return (
    <Box bg="white" mb="8px">
      <Accordion
        title={
          <Box p="24px">
            {anythingInProgress ? (
              <Spinner size="20px" />
            ) : (
              'Recent background jobs'
            )}
          </Box>
        }
      >
        <Box>
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
        </Box>
      </Accordion>
    </Box>
  );
};

export default Tasks;
