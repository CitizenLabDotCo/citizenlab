import { useState, useEffect } from 'react';
import {
  IProjectAllowedInputTopic,
  IProjectAllowedInputTopicsResponse,
  listProjectAllowedInputTopics,
} from 'services/projectAllowedInputTopics';
import { isNilOrError, NilOrError } from 'utils/helperUtils';
import { orderingIsValid } from 'components/admin/ResourceList/utils';

export type IProjectAllowedInputTopicsState =
  | IProjectAllowedInputTopic[]
  | NilOrError;

export default function useProjectAllowedInputTopics(projectId: string) {
  const [projectAllowedInputTopics, setProjectAllowedInputTopics] =
    useState<IProjectAllowedInputTopicsState>(null);

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
            : orderingIsValid(projectAllowedInputTopicsResponse.data)
            ? projectAllowedInputTopicsResponse.data
            : null
        );
      }
    );

    return () => subscription.unsubscribe();
  }, [projectId]);

  return projectAllowedInputTopics;
}
