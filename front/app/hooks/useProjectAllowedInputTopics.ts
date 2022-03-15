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

export default function useProjectAllowedInputTopics(projectId: string) {
  const [projectAllowedInputTopics, setProjectAllowedInputTopics] =
    useState<IProjectAllowedInputTopicsState>(undefined);

  useEffect(() => {
    const subscription = listProjectAllowedInputTopics(
      projectId
    ).observable.subscribe(
      (
        projectAllowedInputTopicsResponse:
          | IProjectAllowedInputTopicsResponse
          | NilOrError
      ) => {
        setProjectAllowedInputTopics(
          isNilOrError(projectAllowedInputTopicsResponse)
            ? projectAllowedInputTopicsResponse
            : projectAllowedInputTopicsResponse.data
        );
      }
    );

    return () => subscription.unsubscribe();
  }, [projectId]);

  return projectAllowedInputTopics;
}
