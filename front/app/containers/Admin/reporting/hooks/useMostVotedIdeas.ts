import { useState, useEffect } from 'react';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import {
  ideasStream,
  IIdeaData,
  IIdeas,
  IIdeasQueryParameters,
} from 'services/ideas';

interface Props {
  projectId: string;
  phaseId?: string;
  numberOfIdeas: number;
}

function useMostVotedIdeas({ projectId, phaseId, numberOfIdeas }: Props) {
  const [ideas, setIdeas] = useState<IIdeaData[] | NilOrError>();

  useEffect(() => {
    const queryParameters: IIdeasQueryParameters = {
      'page[number]': 1,
      'page[size]': numberOfIdeas,
      projects: [projectId],
      phase: phaseId,
      sort: '-upvotes_count',
    };

    const { observable } = ideasStream({ queryParameters });

    const subscription = observable.subscribe(
      (response: IIdeas | NilOrError) => {
        setIdeas(isNilOrError(response) ? response : response.data);
      }
    );

    return () => subscription.unsubscribe();
  }, [projectId, phaseId, numberOfIdeas]);

  return ideas;
}

export default useMostVotedIdeas;
