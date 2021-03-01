import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { Observable, of } from 'rxjs';
import { IPhase, IPhaseData, phaseStream } from 'services/phases';

export default function usePhase(phaseId: string | null) {
  const [phase, setPhase] = useState<IPhaseData | undefined | null | Error>(
    undefined
  );

  useEffect(() => {
    setPhase(undefined);

    let observable: Observable<IPhase | null> = of(null);

    if (phaseId) {
      observable = phaseStream(phaseId).observable;
    }

    const subscription = observable.subscribe((response) => {
      const phase = !isNilOrError(response) ? response.data : response;
      setPhase(phase);
    });

    return () => subscription.unsubscribe();
  }, [phaseId]);

  return phase;
}
