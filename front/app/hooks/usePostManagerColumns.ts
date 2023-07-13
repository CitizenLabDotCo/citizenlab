// hooks
import useProjectById from '../api/projects/useProjectById';
import usePhases from '../api/phases/usePhase';

export default function usePostManagerColumns(
  projectId: string | null,
  phaseId: string | null
) {
  const project = useProjectById(projectId);
  const phase = usePhases(phaseId);
  console.log(phase, project);

  // TODO: Define the correct columns based on voting method etc - use effect etc
  // Error: Too many re-renders. React limits the number of renders to prevent an infinite loop.
  // Probably need useEffect()
  /*
  const [columns, setColumns] = useState<string[]>(
    [
      'selection',
      'assignee',
      'title',
      'published_on',
      'up',
      'down',
    ]
  );
  setColumns([...columns, 'picks']);
   */

  return [
    'selection',
    'assignee',
    'title',
    'published_on',
    'up',
    'down',
    'picks',
  ];
}
