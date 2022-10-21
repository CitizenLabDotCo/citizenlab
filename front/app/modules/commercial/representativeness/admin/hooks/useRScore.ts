import { useEffect, useState } from 'react';
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { RScore, RScoreData, rScoreStream } from '../services/rScore';

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
