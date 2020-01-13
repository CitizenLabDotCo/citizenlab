import { useState, useEffect } from 'react';
import { getParticipationConditions, IParticipationConditions } from 'services/participationConditions';
import { ContextShape } from 'components/VerificationModal/VerificationModal';

// doesn't react to prop changes, which is ok here because components are unmounted btwn uses

export default function useParticipationConditions(props: ContextShape | null) {
  const [conditions, setConditions] = useState<IParticipationConditions | undefined | null | Error>(undefined);

  useEffect(() => {
    const subscription = props ? getParticipationConditions(props.id, props.type, props.action).observable.subscribe((conditions) => {
      setConditions(conditions);
    })
    : null;

    if (subscription) {
      return () => subscription.unsubscribe();
    }
    return;
  }, []);

  return conditions;
}
