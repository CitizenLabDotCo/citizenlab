import { useState } from 'react';

import { chunk } from 'lodash-es';

import { IIdeaData, IIdeaUpdate } from 'api/ideas/types';
import useDeleteIdea from 'api/ideas/useDeleteIdea';
import useUpdateIdea from 'api/ideas/useUpdateIdea';

import tracks from 'components/admin/PostManager/tracks';
import { UNASSIGNED } from 'components/admin/PostManager/useAssigneeOptions';

import { trackEventByName } from 'utils/analytics';

import { phaseIds, topicIds } from '../utils';

// A selection can span every page, too many updates to send at once.
const UPDATE_GROUP_SIZE = 10;

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

  const updateEach = async (requestBody: (idea: IIdeaData) => IIdeaUpdate) => {
    for (const group of chunk(ideas, UPDATE_GROUP_SIZE)) {
      await Promise.allSettled(
        group.map((idea) =>
          updateIdea({ id: idea.id, requestBody: requestBody(idea) }).then(
            (updated) => onUpdated(updated.data)
          )
        )
      );
    }
  };

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
