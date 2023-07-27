import React from 'react';
import useAnalysisBackgroundTasks from 'api/analysis_background_tasks/useAnalysisBackgroundTasks';
import { useParams } from 'react-router-dom';

const Tasks = () => {
  const { analysisId } = useParams() as { analysisId: string };
  const { data: tasks } = useAnalysisBackgroundTasks(analysisId);
  console.log(tasks);
  return <div>Tasks</div>;
};

export default Tasks;
