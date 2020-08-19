import { useState, useEffect } from 'react';
import { IMinimalIdeaData, similarIdeasStream} from 'services/ideas';

export default function useSimilarIdeas({ ideaId, pageSize }) {
  const [similarIdeas, setSimilarIdeas] = useState<IMinimalIdeaData[] | Error | null | undefined>(undefined);
  const queryParameters = { pageSize };

  useEffect(() => {
    const observable = similarIdeasStream(ideaId, { queryParameters }).observable;

    const subscription = observable.subscribe((response) => {
      setSimilarIdeas(response.data);
    });

    return () => subscription.unsubscribe();
  }, [ideaId, pageSize]);

  return similarIdeas;
}
