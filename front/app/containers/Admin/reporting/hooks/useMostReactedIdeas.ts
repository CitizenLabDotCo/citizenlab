// hooks
import useIdeas from 'api/ideas/useIdeas';

interface Props {
  projectId: string;
  phaseId?: string;
  numberOfIdeas: number;
}

function useMostReactedIdeas({ projectId, phaseId, numberOfIdeas }: Props) {
  const { data } = useIdeas({
    'page[number]': 1,
    'page[size]': numberOfIdeas,
    projects: [projectId],
    phase: phaseId,
    sort: '-likes_count',
  });

  return data?.data;
}

export default useMostReactedIdeas;
