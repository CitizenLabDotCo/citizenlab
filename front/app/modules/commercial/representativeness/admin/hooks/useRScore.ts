import { useState, useEffect } from 'react';
import { rScoreStream, RScore, RScoreData } from '../services/rScore';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

export default function useRScore(
  userCustomFieldId: string,
  projectId?: string
) {
  const [rScore, setRScore] = useState<RScoreData | NilOrError>();

  useEffect(() => {
    if (userCustomFieldId === 'bb0d31db-944c-4368-a953-ac8d30b960aa') return;

    const observable = rScoreStream(userCustomFieldId, projectId).observable;
    const subscription = observable.subscribe((rScore: RScore | NilOrError) => {
      setRScore(isNilOrError(rScore) ? rScore : rScore.data);
    });

    return () => subscription.unsubscribe();
  }, [userCustomFieldId, projectId]);

  if (userCustomFieldId === 'bb0d31db-944c-4368-a953-ac8d30b960aa') {
    return {
      id: 'test',
      type: 'rscore',
      attributes: {
        score: 0.6,
        counts: {},
      },
    };
  }

  return rScore;
}
