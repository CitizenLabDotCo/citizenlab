import { useState, useEffect } from 'react';
import { Observable, of } from 'rxjs';
import {
  getPollResponses,
  IPollResponseAttributes,
} from 'services/pollResponses';
import { IParticipationContextType } from 'typings';

interface Params {
  participationContextId: string;
  participationContextType: IParticipationContextType;
}

export default function usePollResponses({
  participationContextId,
  participationContextType,
}: Params) {
  const [pollResponses, setPollResponses] =
    useState<IPollResponseAttributes | null>(null);

  useEffect(() => {
    setPollResponses(null);

    let observable: Observable<IPollResponseAttributes | null> = of(null);

    observable = getPollResponses(
      participationContextId,
      participationContextType
    ).observable;

    const subscription = observable.subscribe((response) => {
      setPollResponses(response);
    });

    return () => subscription.unsubscribe();
  }, [participationContextId, participationContextType]);

  return pollResponses;
}
