import { useState, useEffect } from 'react';
import { of, Observable } from 'rxjs';
import {
  Response,
  ParticipationConditions,
  getGlobalParticipationConditions,
  getPCParticipationConditions,
} from 'services/participationConditions';
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { AuthenticationContext } from 'api/authentication/authentication_requirements/types';

// doesn't react to prop changes, which is ok here because components are unmounted btwn uses

export default function useParticipationConditions(
  props: AuthenticationContext | null
) {
  const [conditions, setConditions] = useState<
    ParticipationConditions | undefined | null | Error
  >(undefined);

  useEffect(() => {
    const stream: Observable<Response | null> =
      props?.type === 'project' || props?.type === 'phase'
        ? getPCParticipationConditions(props.id, props.type, props.action)
            .observable
        : props?.type === 'initiative'
        ? getGlobalParticipationConditions(props.action).observable
        : of(null);

    const subscription = stream.subscribe(
      (conditions: Response | NilOrError) => {
        setConditions(
          isNilOrError(conditions)
            ? conditions
            : conditions.data.attributes.participation_conditions
        );
      }
    );

    return () => subscription.unsubscribe();
  }, [props]);

  return conditions;
}
