import { useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { chunk } from 'lodash-es';

import { IIdea, IIdeaData, IIdeaUpdate } from 'api/ideas/types';
import { deleteIdea, invalidateAfterIdeaDelete } from 'api/ideas/useDeleteIdea';
import { invalidateAfterIdeaUpdate, updateIdea } from 'api/ideas/useUpdateIdea';

import tracks from 'components/admin/PostManager/tracks';
import { UNASSIGNED } from 'components/admin/PostManager/useAssigneeOptions';

import { trackEventByName } from 'utils/analytics';

import { phaseIds, topicIds } from '../utils';

// A selection can span every page, too many requests to send at once.
const GROUP_SIZE = 10;

const useBatchActions = ({
  ideas,
  onUpdated,
  onDeleted,
}: {
  ideas: IIdeaData[];
  onUpdated?: (ideas: IIdeaData[]) => void;
  onDeleted: () => void;
}) => {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  // The requests go out without their mutation hooks, so the cache refreshes
  // once for the whole batch rather than after every input.
  const updateEach = async (requestBody: (idea: IIdeaData) => IIdeaUpdate) => {
    const updated: IIdea[] = [];

    for (const group of chunk(ideas, GROUP_SIZE)) {
      const results = await Promise.allSettled(
        group.map((idea) =>
          updateIdea({ id: idea.id, requestBody: requestBody(idea) })
        )
      );
      results.forEach((result) => {
        if (result.status === 'fulfilled') updated.push(result.value);
      });
    }

    if (updated.length === 0) return;

    invalidateAfterIdeaUpdate(queryClient, updated);
    onUpdated?.(updated.map((idea) => idea.data));
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

    // Inputs that failed to delete stay in the list.
    for (const group of chunk(ideas, GROUP_SIZE)) {
      await Promise.allSettled(group.map((idea) => deleteIdea(idea.id)));
    }

    invalidateAfterIdeaDelete(
      queryClient,
      ideas.map((idea) => idea.id)
    );
    setIsDeleting(false);
    onDeleted();
  };

  return { setStatus, assign, toggleTag, copyToPhase, deleteAll, isDeleting };
};

export default useBatchActions;
