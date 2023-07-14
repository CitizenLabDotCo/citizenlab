// hooks
import useProjectById from '../api/projects/useProjectById';
import usePhases from '../api/phases/usePhase';
import { useMemo } from 'react';

export default function usePostManagerColumns(
  selectedProject?: string | null,
  selectedPhase?: string | null
) {
  const project = useProjectById(
    selectedProject === undefined ? null : selectedProject
  );
  const phase = usePhases(selectedPhase === undefined ? null : selectedPhase);

  const columns = useMemo(() => {
    const coreColumns = new Set<string>(['selection', 'assignee', 'title']);
    const attributes = selectedPhase
      ? phase.data?.data.attributes
      : project.data?.data.attributes;
    if (attributes) {
      if (attributes.participation_method === 'voting') {
        // Budgeting
        coreColumns.add('picks').add('budget').add('comments');
        // Single voting
        // coreColumns.add('votes').add('comments');
        // Multiple voting
        // coreColumns.add('votes').add('participants').add('comments');
        // TODO: Add budget and participants columns
      } else {
        coreColumns.add('comments').add('up').add('down').add('published_on');
      }
    }
    return coreColumns;
  }, [project, phase]);

  return columns;
}
