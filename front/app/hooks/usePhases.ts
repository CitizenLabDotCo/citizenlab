import { useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { Observable, of } from 'rxjs';
import { phasesStream, IPhaseData, IPhases } from 'services/phases';

export default function useProject(projectId: string | null | undefined) {
  const [phases, setPhases] = useState<IPhaseData[] | undefined | null | Error>(
    undefined
  );

  useEffect(() => {
    setPhases(undefined);

    let observable: Observable<IPhases | null> = of(null);

    if (projectId) {
      observable = phasesStream(projectId).observable;
    }

    const subscription = observable.subscribe((response) => {
      const phases = !isNilOrError(response) ? response.data : response;
      setPhases(phases);
    });

    return () => subscription.unsubscribe();
  }, [projectId]);

  return phases;
}
