import { useState } from 'react';

import { IIdeaData, IIdeaUpdate } from 'api/ideas/types';
import useDeleteIdea from 'api/ideas/useDeleteIdea';
import useUpdateIdea from 'api/ideas/useUpdateIdea';

import tracks from 'components/admin/PostManager/tracks';
import { UNASSIGNED } from 'components/admin/PostManager/useAssigneeOptions';

import { trackEventByName } from 'utils/analytics';

import { phaseIds, topicIds } from '../utils';

const useBatchActions = ({
  ideas,
  onUpdated,
  onDeleted,
}: {
  ideas: IIdeaData[];
  onUpdated: (idea: IIdeaData) => void;
  onDeleted: () => void;
}) => {
  const { mutateAsync: updateIdea } = useUpdateIdea();
  const { mutateAsync: deleteIdea } = useDeleteIdea();
  const [isDeleting, setIsDeleting] = useState(false);

  const updateEach = (requestBody: (idea: IIdeaData) => IIdeaUpdate) =>
    Promise.allSettled(
      ideas.map((idea) =>
        updateIdea({ id: idea.id, requestBody: requestBody(idea) }).then(
          (updated) => onUpdated(updated.data)
        )
      )
    );

  const setStatus = (statusId: string) => {
    updateEach(() => ({ idea_status_id: statusId }));
    trackEventByName(tracks.ideaStatusChange, {
      location: 'Input manager',
      method: 'Batch action',
    });
  };

  const assign = (assigneeId: string) => {
    updateEach(() => ({
      assignee_id: assigneeId === UNASSIGNED ? null : assigneeId,
    }));
    trackEventByName(tracks.changeIdeaAssignment, {
      location: 'Input manager',
      method: 'Batch action',
    });
  };

  const toggleTag = (tagId: string) => {
    const allHaveTag = ideas.every((idea) => topicIds(idea).includes(tagId));

    updateEach((idea) => ({
      topic_ids: allHaveTag
        ? topicIds(idea).filter((id) => id !== tagId)
        : [...new Set([...topicIds(idea), tagId])],
    }));
  };

  const copyToPhase = (phaseId: string) =>
    updateEach((idea) => ({
      phase_ids: [...new Set([...phaseIds(idea), phaseId])],
    }));

  const deleteAll = async () => {
    setIsDeleting(true);

    // Deleting several inputs in parallel overloads the database, so they go
    // one by one.
    for (const idea of ideas) {
      try {
        await deleteIdea(idea.id);
      } catch {
        // Inputs that failed to delete stay in the list.
      }
    }

    setIsDeleting(false);
    onDeleted();
  };

  return { setStatus, assign, toggleTag, copyToPhase, deleteAll, isDeleting };
};

export default useBatchActions;
