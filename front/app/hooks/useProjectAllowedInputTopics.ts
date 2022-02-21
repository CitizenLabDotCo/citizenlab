import { useState, useEffect } from 'react';
import { projectByIdStream, IProject } from 'services/projects';
import {
  IProjectAllowedInputTopic,
  IProjectAllowedInputTopicResponse,
  projectAllowedInputTopicStream,
} from 'services/projectAllowedInputTopics';
import { combineLatest, of, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { isNilOrError, NilOrError, reduceErrors } from 'utils/helperUtils';
import { attributes } from 'components/UI/QuillEditor/altTextToImagesModule';
import ProjectAllowedInputTopics from 'modules/commercial/custom_topics/admin/containers/ProjectAllowedInputTopics';

export type IProjectAllowedInputTopicsState =
  | IProjectAllowedInputTopic[]
  | NilOrError;

export default function useProjectAllowedInputTopics(projectId?: string) {
  const [projectAllowedInputTopics, setProjectAllowedInputTopics] =
    useState<IProjectAllowedInputTopicsState>(undefined);

  useEffect(() => {
    if (!projectId) return;

    const observable = createObservable(projectId);
    const subscription = createSubscription(
      observable,
      setProjectAllowedInputTopics
    );

    return () => subscription.unsubscribe();
  }, [projectId]);

  return projectAllowedInputTopics;
}

export function createObservable(projectId: string) {
  const projectObservable = projectByIdStream(projectId).observable;

  const observable = projectObservable.pipe(
    switchMap((project: IProject | NilOrError) => {
      if (isNilOrError(project)) return of(project);

      const projectAllowedInputTopicIds =
        getProjectAllowedInputTopicIds(project);

      return combineLatest(
        projectAllowedInputTopicIds.map((id) => {
          return projectAllowedInputTopicStream(id).observable.pipe(
            map((response: IProjectAllowedInputTopicResponse | NilOrError) => {
              return isNilOrError(response) ? response : response.data;
            })
          );
        })
      );
    })
  );

  return observable;
}

type AllowedInputTopicObservable = Observable<
  NilOrError | (IProjectAllowedInputTopic | NilOrError)[]
>;

type AllowedInputTopicCallback = (
  allowedInputTopicsWithTopicData: IProjectAllowedInputTopic[] | NilOrError
) => void;

export function createSubscription(
  observable: AllowedInputTopicObservable,
  callback: AllowedInputTopicCallback
) {
  return observable.subscribe(
    reduceErrors<IProjectAllowedInputTopic>(
      (projectAllowedInputTopics: IProjectAllowedInputTopic[] | NilOrError) => {
        if (isNilOrError(projectAllowedInputTopics)) {
          callback(projectAllowedInputTopics);
          return;
        }

        callback(sortByOrdering(projectAllowedInputTopics));
      }
    )
  );
}

function getProjectAllowedInputTopicIds(project: IProject) {
  const relationship =
    project.data.relationships.projects_allowed_input_topics.data;
  return relationship.map(({ id }) => id);
}

const sortByOrdering = (
  projectAllowedInputTopics: IProjectAllowedInputTopic[]
) => {
  const cloned = [...projectAllowedInputTopics];
  cloned.sort((a, b) => a.attributes.ordering - b.attributes.ordering);

  return cloned;
};
