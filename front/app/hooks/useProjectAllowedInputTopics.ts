import { useState, useEffect } from 'react';
import {
  IProjectAllowedInputTopic,
  IProjectAllowedInputTopicsResponse,
  projectAllowedInputTopicsStream,
} from 'services/projectAllowedInputTopics';
import { ITopic, ITopicData, topicByIdStream } from 'services/topics';
import { combineLatest, of, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

export interface IProjectAllowedInputTopicWithTopicData
  extends IProjectAllowedInputTopic {
  topicData: ITopicData;
}

export type IProjectAllowedInputTopicsState =
  | IProjectAllowedInputTopicWithTopicData[]
  | undefined
  | null
  | Error;

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
  return projectAllowedInputTopicsStream(projectId).observable.pipe(
    switchMap(
      (allowedInputTopics: IProjectAllowedInputTopicsResponse | NilOrError) => {
        if (isNilOrError(allowedInputTopics)) {
          return of(allowedInputTopics);
        }

        return combineLatest(
          allowedInputTopics.data.map((allowedInputTopic) => {
            const topicId = allowedInputTopic.relationships.topic.data.id;

            return topicByIdStream(topicId).observable.pipe(
              map((topic: ITopic | NilOrError) =>
                isNilOrError(topic)
                  ? topic
                  : attachTopic(allowedInputTopic, topic.data)
              )
            );
          })
        );
      }
    )
  );
}

type AllowedInputTopicObservable = Observable<
  NilOrError | (IProjectAllowedInputTopicWithTopicData | NilOrError)[]
>;

type AllowedInputTopicCallback = (
  allowedInputTopicsWithTopicData:
    | IProjectAllowedInputTopicWithTopicData[]
    | NilOrError
) => void;

export function createSubscription(
  observable: AllowedInputTopicObservable,
  callback: AllowedInputTopicCallback
) {
  return observable.subscribe((topics) => {
    if (isNilOrError(topics)) {
      callback(topics);
      return;
    }

    const nilOrErrorTopics = topics.filter(isNilOrError);
    nilOrErrorTopics.length > 0
      ? callback(nilOrErrorTopics[0])
      : callback(topics as IProjectAllowedInputTopicWithTopicData[]);
  });
}

function attachTopic(
  allowedInputTopic: IProjectAllowedInputTopic,
  topicData: ITopicData
): IProjectAllowedInputTopicWithTopicData {
  return {
    ...allowedInputTopic,
    topicData,
  };
}
