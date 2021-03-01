import { useState, useEffect } from 'react';
import { of, Observable } from 'rxjs';
import {
  IParticipationConditions,
  getGlobalParticipationConditions,
  getPCParticipationConditions,
} from 'services/participationConditions';
import { ContextShape } from 'components/Verification/VerificationModal';

// doesn't react to prop changes, which is ok here because components are unmounted btwn uses

export default function useParticipationConditions(props: ContextShape) {
  const [conditions, setConditions] = useState<
    IParticipationConditions | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const stream: Observable<IParticipationConditions | null> =
      props?.type === 'project' || props?.type === 'phase'
        ? getPCParticipationConditions(props.id, props.type, props.action)
            .observable
        : props?.type === 'initiative'
        ? getGlobalParticipationConditions(props.action).observable
        : of(null);
    const subscription = stream.subscribe((conditions) => {
      setConditions(conditions);
    });

    return () => subscription.unsubscribe();
  }, [props]);

  return conditions;
}
