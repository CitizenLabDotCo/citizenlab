import { useState, useEffect } from 'react';

// services
import { ideasCount, IIdeasCount } from 'services/stats';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

export interface Props {
  projectIds?: string[];
  phaseId?: string;
  topics?: string[];
  ideaStatusId?: string;
  feedbackNeeded?: boolean;
  assignee?: string;
  search?: string;
}

export default function useIdeasCount({
  projectIds,
  phaseId,
  topics,
  ideaStatusId,
  feedbackNeeded,
  assignee,
  search,
}: Props) {
  const [count, setCount] = useState<number | NilOrError>();

  const projectIdsStr = JSON.stringify(projectIds ?? []);
  const topicsStr = JSON.stringify(topics ?? []);

  useEffect(() => {
    const projectIds = JSON.parse(projectIdsStr);
    const topics = JSON.parse(topicsStr);

    const queryParameters = {
      projects: projectIds.length > 0 ? projectIds : undefined,
      phase: phaseId,
      topics,
      idea_status: ideaStatusId,
      feedback_needed: feedbackNeeded,
      assignee,
      search,
    };

    const { observable } = ideasCount({ queryParameters });

    const subscription = observable.subscribe(
      (response: IIdeasCount | NilOrError) => {
        setCount(
          isNilOrError(response) ? response : response.data.attributes.count
        );
      }
    );

    return () => subscription.unsubscribe();
  }, [
    projectIdsStr,
    phaseId,
    topicsStr,
    ideaStatusId,
    feedbackNeeded,
    assignee,
    search,
  ]);

  return count;
}
