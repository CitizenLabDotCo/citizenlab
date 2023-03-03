// hooks
import useIdeas from 'api/ideas/useIdeas';

interface Props {
  projectId: string;
  phaseId?: string;
  numberOfIdeas: number;
}

function useMostVotedIdeas({ projectId, phaseId, numberOfIdeas }: Props) {
  const { data } = useIdeas({
    'page[number]': 1,
    'page[size]': numberOfIdeas,
    projects: [projectId],
    phase: phaseId,
    sort: '-upvotes_count',
  });

  return data?.data;
}

export default useMostVotedIdeas;
