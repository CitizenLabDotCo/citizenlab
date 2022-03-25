import { useState, useEffect } from 'react';
import {
  IProjectAllowedInputTopic,
  listProjectAllowedInputTopics,
} from 'services/projectAllowedInputTopics';
import { isNilOrError, NilOrError } from 'utils/helperUtils';
// import { orderingIsValid } from 'components/admin/ResourceList/utils';

export type IProjectAllowedInputTopicsState =
  | IProjectAllowedInputTopic[]
  | NilOrError;

export default function useProjectAllowedInputTopics(projectId: string) {
  const [projectAllowedInputTopics, setProjectAllowedInputTopics] =
    useState<IProjectAllowedInputTopicsState>(null);

  useEffect(() => {
    const subscription = listProjectAllowedInputTopics(
      projectId
    ).observable.subscribe((projectAllowedInputTopicsResponse) => {
      setProjectAllowedInputTopics(
        !isNilOrError(projectAllowedInputTopicsResponse)
          ? projectAllowedInputTopicsResponse.data
          : null
      );
    });

    return () => subscription.unsubscribe();
  }, [projectId]);

  return projectAllowedInputTopics;
}
