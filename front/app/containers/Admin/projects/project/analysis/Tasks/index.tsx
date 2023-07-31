import React from 'react';
import useAnalysisBackgroundTasks from 'api/analysis_background_tasks/useAnalysisBackgroundTasks';
import { useParams } from 'react-router-dom';
import { Accordion, Box } from '@citizenlab/cl2-component-library';

const Tasks = () => {
  const { analysisId } = useParams() as { analysisId: string };
  const { data: tasks } = useAnalysisBackgroundTasks(analysisId);

  return (
    <Box bg="white" mb="8px">
      <Accordion title={<Box p="24px">Recent tasks</Box>}>
        <Box>
          {tasks?.data.map((task) => {
            return (
              <Box p="24px" key={task.id}>
                <div>{task.attributes.type}</div>
                {task.attributes.type === 'auto_tagging_task' && (
                  <div>{task.attributes.auto_tagging_method}</div>
                )}
                <div>{task.attributes.progress}</div>
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
