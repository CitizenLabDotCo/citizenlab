import { useState, useEffect } from 'react';
import { rScoreStream, RScore, RScoreData } from '../services/rScore';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

export default function useRScore(
  userCustomFieldId: string,
  projectId?: string
) {
  const [rScore, setRScore] = useState<RScoreData | NilOrError>();

  useEffect(() => {
    const observable = rScoreStream(userCustomFieldId, projectId).observable;
    const subscription = observable.subscribe((rScore: RScore | NilOrError) => {
      setRScore(isNilOrError(rScore) ? rScore : rScore.data);
    });

    return () => subscription.unsubscribe();
  }, [userCustomFieldId, projectId]);

  return rScore;
}
