import { useState, useEffect } from 'react';
import {
  IProjectAllowedInputTopic,
  listProjectAllowedInputTopics,
} from 'services/projectAllowedInputTopics';
import { NilOrError } from 'utils/helperUtils';

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
      setProjectAllowedInputTopics(projectAllowedInputTopicsResponse.data);
    });

    return () => subscription.unsubscribe();
  }, [projectId]);

  return projectAllowedInputTopics;
}
