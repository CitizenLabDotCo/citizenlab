import { useRef, useState } from 'react';

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
  // isDeleting only updates after a render, so a double click needs this.
  const deleting = useRef(false);

  // The requests go out without their mutation hooks, so the cache refreshes
  // once for the whole batch rather than after every input.
  const updateEach = async (
    targets: IIdeaData[],
    requestBody: (idea: IIdeaData) => IIdeaUpdate
  ) => {
    const updated: IIdea[] = [];

    for (const group of chunk(targets, GROUP_SIZE)) {
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
    const targets = ideas.filter(
      (idea) => idea.relationships.idea_status.data?.id !== statusId
    );
    if (targets.length === 0) return;

    updateEach(targets, () => ({ idea_status_id: statusId }));
    trackEventByName(tracks.ideaStatusChange, {
      location: 'Input manager',
      method: 'Batch action',
    });
  };

  const assign = (assigneeId: string) => {
    const targets = ideas.filter(
      (idea) =>
        (idea.relationships.assignee?.data?.id ?? UNASSIGNED) !== assigneeId
    );
    if (targets.length === 0) return;

    updateEach(targets, () => ({
      assignee_id: assigneeId === UNASSIGNED ? null : assigneeId,
    }));
    trackEventByName(tracks.changeIdeaAssignment, {
      location: 'Input manager',
      method: 'Batch action',
    });
  };

  const toggleTag = (tagId: string) => {
    const withoutTag = ideas.filter((idea) => !topicIds(idea).includes(tagId));

    if (withoutTag.length === 0) {
      updateEach(ideas, (idea) => ({
        topic_ids: topicIds(idea).filter((id) => id !== tagId),
      }));
    } else {
      updateEach(withoutTag, (idea) => ({
        topic_ids: [...topicIds(idea), tagId],
      }));
    }
  };

  const copyToPhase = (phaseId: string) =>
    updateEach(
      ideas.filter((idea) => !phaseIds(idea).includes(phaseId)),
      (idea) => ({ phase_ids: [...phaseIds(idea), phaseId] })
    );

  const deleteAll = async () => {
    if (deleting.current) return;

    deleting.current = true;
    setIsDeleting(true);

    // Inputs that failed to delete stay in the list.
    for (const group of chunk(ideas, GROUP_SIZE)) {
      await Promise.allSettled(group.map((idea) => deleteIdea(idea.id)));
    }

    invalidateAfterIdeaDelete(
      queryClient,
      ideas.map((idea) => idea.id)
    );
    deleting.current = false;
    setIsDeleting(false);
    onDeleted();
  };

  return { setStatus, assign, toggleTag, copyToPhase, deleteAll, isDeleting };
};

export default useBatchActions;
