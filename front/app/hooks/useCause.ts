import { useEffect, useState } from 'react';
import { causeByIdStream, ICauseData } from 'services/causes';

interface Input {
  causeId: string;
}

export default function useCause({ causeId }: Input) {
  const [cause, setCause] = useState<ICauseData | undefined | null | Error>(
    undefined
  );

  useEffect(() => {
    const subscription = causeByIdStream(causeId).observable.subscribe(
      (cause) => {
        setCause(cause.data);
      }
    );

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return cause;
}
