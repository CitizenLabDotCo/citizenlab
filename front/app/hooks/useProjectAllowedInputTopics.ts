import { useState, useEffect } from 'react';
import {
  IProjectAllowedInputTopic,
  IProjectAllowedInputTopicsResponse,
  listProjectAllowedInputTopics,
} from 'services/projectAllowedInputTopics';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

export type IProjectAllowedInputTopicsState =
  | IProjectAllowedInputTopic[]
  | NilOrError;

export default function useProjectAllowedInputTopics(projectId?: string) {
  const [projectAllowedInputTopics, setProjectAllowedInputTopics] =
    useState<IProjectAllowedInputTopicsState>(undefined);

  useEffect(() => {
    if (!projectId) return;
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
      projectAllowedInputTopicsResponse:
        | IProjectAllowedInputTopicsResponse
        | NilOrError
    ) => {
      isNilOrError(projectAllowedInputTopicsResponse)
        ? setter(projectAllowedInputTopicsResponse)
        : setter(projectAllowedInputTopicsResponse.data);
    }
  );

  return subscription;
}
