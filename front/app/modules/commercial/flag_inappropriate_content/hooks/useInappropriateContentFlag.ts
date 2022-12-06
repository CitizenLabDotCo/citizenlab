import { useState, useEffect } from 'react';
import { Observable, of } from 'rxjs';
import {
  inappropriateContentFlagByIdStream,
  IInappropriateContentFlag,
  IInappropriateContentFlagData,
} from '../services/inappropriateContentFlags';
import { isNilOrError } from 'utils/helperUtils';

export default function useInappropriateContentFlag(
  inappropriateContentFlagId: string
) {
  const [inappropriateContentFlag, setInappropriateContentFlag] = useState<
    IInappropriateContentFlagData | undefined | null | Error
  >(undefined);

  useEffect(() => {
    setInappropriateContentFlag(undefined);

    let observable: Observable<IInappropriateContentFlag | null> = of(null);

    observable = inappropriateContentFlagByIdStream(
      inappropriateContentFlagId
    ).observable;

    const subscription = observable.subscribe((response) => {
      const idea = !isNilOrError(response) ? response.data : response;
      setInappropriateContentFlag(idea);
    });

    return () => subscription.unsubscribe();
  }, [inappropriateContentFlagId]);

  return inappropriateContentFlag;
}
