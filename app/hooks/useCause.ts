import { useState, useEffect } from 'react';
import { ICause, causeByIdStream } from 'services/causes';

interface Input {
  causeId: string;
}

export default function useCause({ causeId } : Input) {
  const [cause, setCause] = useState<ICause | undefined | null | Error>(undefined);

  useEffect(() => {

    const subscription = causeByIdStream(causeId).observable.subscribe((cause) => {
      setCause(cause);
    });

    return () => subscription.unsubscribe();
  }, []);

  return cause;
}
