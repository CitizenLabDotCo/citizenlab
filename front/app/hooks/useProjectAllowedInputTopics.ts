import { useState, useEffect } from 'react';
import {
  IProjectAllowedInputTopic,
  IProjectAllowedInputTopics,
  listProjectAllowedInputTopics,
} from 'services/projectAllowedInputTopics';
import { isNilOrError, NilOrError } from 'utils/helperUtils';
// import { orderingIsValid } from 'components/admin/ResourceList/utils';

export type IProjectAllowedInputTopicsState =
  | IProjectAllowedInputTopic[]
  | NilOrError;

export default function useProjectAllowedInputTopics(projectId: string) {
  const [projectAllowedInputTopics, setProjectAllowedInputTopics] =
    useState<IProjectAllowedInputTopicsState>(undefined);

  useEffect(() => {
    const subscription = createSubscription(
      projectId,
      setProjectAllowedInputTopics
    );

    return () => subscription.unsubscribe();
  }, [projectId]);

  return projectAllowedInputTopics;
}

export function createSubscription(
  projectId: string,
  setter: (
    projectAllowedInputTopics: IProjectAllowedInputTopic[] | NilOrError
  ) => void
) {
  const observable = listProjectAllowedInputTopics(projectId).observable;
  const subscription = observable.subscribe(
    (
      projectAllowedInputTopicsResponse: IProjectAllowedInputTopics | NilOrError
    ) => {
      if (isNilOrError(projectAllowedInputTopicsResponse)) {
        setter(projectAllowedInputTopicsResponse);
        return;
      }

      const { data } = projectAllowedInputTopicsResponse;

      // Sometimes the ordering is temporarily invalid because of
      // optimistic caching in streams.ts. This makes sure that
      // the hook/resource only returns data with valid ordering.
      // if (orderingIsValid(data)) {
      //   setter(data);
      // }
      // Skipping this for now because of more issues with the ordering
      // TODO: fix

      setter(data);
    }
  );

  return subscription;
}
