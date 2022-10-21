import { useEffect, useState } from 'react';
import { Observable, of } from 'rxjs';
import {
  getGlobalParticipationConditions,
  getPCParticipationConditions,
  IParticipationConditions,
} from 'services/participationConditions';

import { ContextShape } from 'components/Verification/verificationModalEvents';

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
