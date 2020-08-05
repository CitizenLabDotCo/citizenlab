import { useState, useEffect } from 'react';
import { of, Observable } from 'rxjs';
import {
  getParticipationConditions,
  IParticipationConditions,
} from 'services/participationConditions';
import { ProjectContext } from 'components/Verification/VerificationSteps';

// doesn't react to prop changes, which is ok here because components are unmounted btwn uses

export default function useParticipationConditions(
  props: ProjectContext | null
) {
  const [conditions, setConditions] = useState<
    IParticipationConditions | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const stream: Observable<IParticipationConditions | null> = props
      ? getParticipationConditions(props.id, props.type, props.action)
          .observable
      : of(null);
    const subscription = stream.subscribe((conditions) => {
      setConditions(conditions);
    });

    return () => subscription.unsubscribe();
  }, [props]);

  return conditions;
}
