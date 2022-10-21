import { useEffect, useState } from 'react';
import { Observable, of } from 'rxjs';
import { IPhaseData, IPhases, phasesStream } from 'services/phases';
import { isNilOrError } from 'utils/helperUtils';

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
