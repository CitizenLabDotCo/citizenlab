import { useEffect, useState } from 'react';
import { Observable, of } from 'rxjs';
import { IPhase, IPhaseData, phaseStream } from 'services/phases';
import { isNilOrError } from 'utils/helperUtils';

export type TPhase = IPhaseData | null | Error;

export default function usePhase(phaseId: string | null) {
  const [phase, setPhase] = useState<TPhase>(null);

  useEffect(() => {
    setPhase(null);

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
