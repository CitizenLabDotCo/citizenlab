import { useState, useEffect } from 'react';
import { Observable, of } from 'rxjs';
import {
  IPollOptionData,
  IPollOptions,
  pollOptionsStream,
} from 'services/pollOptions';

export default function usePollResponses(questionId: string) {
  const [pollOptions, setPollOptions] = useState<
    IPollOptionData[] | null | Error
  >(null);
  useEffect(() => {
    setPollOptions(null);

    let observable: Observable<IPollOptions | null> = of(null);

    observable = pollOptionsStream(questionId).observable;

    const subscription = observable.subscribe((response) => {
      setPollOptions(response?.data || null);
    });

    return () => subscription.unsubscribe();
  }, [questionId]);

  return pollOptions;
}
