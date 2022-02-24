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

    const observable = listProjectAllowedInputTopics(projectId).observable;
    const subscription = observable.subscribe(
      (
        projectAllowedInputTopicsResponse:
          | IProjectAllowedInputTopicsResponse
          | NilOrError
      ) => {
        isNilOrError(projectAllowedInputTopicsResponse)
          ? setProjectAllowedInputTopics(projectAllowedInputTopicsResponse)
          : setProjectAllowedInputTopics(
              projectAllowedInputTopicsResponse.data
            );
      }
    );

    return () => subscription.unsubscribe();
  }, [projectId]);

  return projectAllowedInputTopics;
}
