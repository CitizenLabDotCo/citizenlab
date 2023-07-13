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

  // if (phase.data) {
  //   console.log('phase', phase.data.attributes);
  // }
  //
  // if (project.data) {
  //   console.log('phase', project.data.attributes);
  // }
  console.log('project', project);

  const coreColumns = new Set<string>([
    'selection',
    'assignee',
    'title',
    'published_on',
  ]);

  const columns = useMemo(() => {
    if (selectedPhase) {
      return coreColumns;
    } else {
      return coreColumns.add('up').add('up').add('picks');
    }
  }, [project, phase]);

  return columns;
}
