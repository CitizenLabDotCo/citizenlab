import { useState, useEffect } from 'react';
import { IMinimalIdeaData, similarIdeasStream } from 'services/ideas';

interface Parameters {
  ideaId: string;
  pageSize?: number;
}

export default function useSimilarIdeas({ ideaId, pageSize = 5 }: Parameters) {
  const [similarIdeas, setSimilarIdeas] = useState<
    IMinimalIdeaData[] | Error | null | undefined
  >(undefined);
  const queryParameters = { pageSize };

  useEffect(() => {
    const observable = similarIdeasStream(ideaId, { queryParameters })
      .observable;

    const subscription = observable.subscribe((response) => {
      setSimilarIdeas(response.data);
    });

    return () => subscription.unsubscribe();
  }, [ideaId, pageSize]);

  return similarIdeas;
}
