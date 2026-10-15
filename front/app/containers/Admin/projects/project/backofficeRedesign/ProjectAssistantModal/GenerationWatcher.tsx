import { useEffect, useRef } from 'react';

import useProjectGenerationJob from 'api/project_generations/useProjectGenerationJob';

// Polls the real generation job for the project and reports completion exactly
// once. Mounted only while a run is in flight (so the /jobs poll never fires
// before a project exists) and keyed per run (so a redraft gets a fresh watch).
// `since` guards against the previous, already-completed job briefly looking
// like "done" before the new run's tracker appears.
type Props = {
  projectId: string;
  since: string;
  onComplete: (succeeded: boolean) => void;
};

const GenerationWatcher = ({ projectId, since, onComplete }: Props) => {
  const jobsQuery = useProjectGenerationJob(projectId);
  const newest = jobsQuery.data?.data[0];
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current || !newest) return;
    const completed = newest.attributes.completed_at !== null;
    const isThisRun =
      new Date(newest.attributes.created_at).getTime() >=
      new Date(since).getTime() - 2000;
    if (completed && isThisRun) {
      firedRef.current = true;
      onComplete(newest.attributes.error_count === 0);
    }
  }, [newest, since, onComplete]);

  return null;
};

export default GenerationWatcher;
