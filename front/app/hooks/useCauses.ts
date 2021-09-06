import { useState, useEffect } from 'react';
import { causesStream, ICauses } from 'services/causes';

interface Input {
  projectId: string | null;
  phaseId: string | null;
}

export default function useCauses(input: Input) {
  const [causes, setCauses] = useState<ICauses | undefined | null | Error>(
    undefined
  );

  useEffect(() => {
    let subscription;
    if (input.phaseId) {
      subscription = causesStream('phase', input.phaseId);
    } else if (input.projectId) {
      subscription = causesStream('project', input.projectId);
    }

    subscription = subscription.observable.subscribe((causes) => {
      setCauses(causes);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return causes;
}
