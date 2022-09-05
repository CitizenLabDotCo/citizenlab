import { useState, useEffect } from 'react';
import { Observable, of } from 'rxjs';
import { IPollOption, pollOptionsStream } from 'services/pollOptions';

export default function usePollResponses(questionId: string) {
  const [pollOptions, setPollOptions] = useState<
    { data: IPollOption[] } | null | Error
  >(null);
  useEffect(() => {
    setPollOptions(null);

    let observable: Observable<{ data: IPollOption[] } | null> = of(null);

    observable = pollOptionsStream(questionId).observable;

    const subscription = observable.subscribe((response) => {
      setPollOptions(response);
    });

    return () => subscription.unsubscribe();
  }, [questionId]);

  return pollOptions;
}
