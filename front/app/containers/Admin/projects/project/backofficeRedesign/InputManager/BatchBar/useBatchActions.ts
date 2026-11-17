import { useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { IIdea, IIdeaData, IIdeaUpdate } from 'api/ideas/types';
import { deleteIdea, invalidateAfterIdeaDelete } from 'api/ideas/useDeleteIdea';
import { invalidateAfterIdeaUpdate, updateIdea } from 'api/ideas/useUpdateIdea';

import tracks from 'components/admin/PostManager/tracks';
import { UNASSIGNED } from 'components/admin/PostManager/useAssigneeOptions';

import { trackEventByName } from 'utils/analytics';
import { inGroupsOf } from 'utils/helperUtils';

import { phaseIds, topicIds } from '../utils';

// A selection can span every page, too many requests to send at once.
const GROUP_SIZE = 10;

export type BatchAttribute = 'status' | 'assignee' | 'tags' | 'phases';

export interface BatchFailure {
  action: 'update' | 'delete';
  failed: number;
  total: number;
}

const useBatchActions = ({
  ideas,
  onUpdated,
  onDeleted,
}: {
  ideas: IIdeaData[];
  onUpdated?: (ideas: IIdeaData[], attribute: BatchAttribute) => void;
  onDeleted: (ideaIds: string[]) => void;
}) => {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [failure, setFailure] = useState<BatchFailure>();
  // isDeleting only updates after a render, so a double click needs this.
  const deleting = useRef(false);

  // The requests go out without their mutation hooks, so the cache refreshes
  // once for the whole batch rather than after every input.
  const updateEach = async (
    targets: IIdeaData[],
    attribute: BatchAttribute,
    requestBody: (idea: IIdeaData) => IIdeaUpdate
  ) => {
    const updated: IIdea[] = [];
    setFailure(undefined);

    for (const group of inGroupsOf(targets, GROUP_SIZE)) {
      const results = await Promise.allSettled(
        group.map((idea) =>
          updateIdea({ id: idea.id, requestBody: requestBody(idea) })
        )
      );
      results.forEach((result) => {
        if (result.status === 'fulfilled') updated.push(result.value);
      });
    }

    if (updated.length < targets.length) {
      setFailure({
        action: 'update',
        failed: targets.length - updated.length,
        total: targets.length,
      });
    }
    if (updated.length === 0) return;

    invalidateAfterIdeaUpdate(queryClient, updated);
    onUpdated?.(
      updated.map((idea) => idea.data),
      attribute
    );
  };

  const setStatus = (statusId: string) => {
    const targets = ideas.filter(
      (idea) => idea.relationships.idea_status.data?.id !== statusId
    );
    if (targets.length === 0) return;

    updateEach(targets, 'status', () => ({ idea_status_id: statusId }));
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

    updateEach(targets, 'assignee', () => ({
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
      updateEach(ideas, 'tags', (idea) => ({
        topic_ids: topicIds(idea).filter((id) => id !== tagId),
      }));
    } else {
      updateEach(withoutTag, 'tags', (idea) => ({
        topic_ids: [...topicIds(idea), tagId],
      }));
    }
  };

  const copyToPhase = (phaseId: string) =>
    updateEach(
      ideas.filter((idea) => !phaseIds(idea).includes(phaseId)),
      'phases',
      (idea) => ({ phase_ids: [...phaseIds(idea), phaseId] })
    );

  const deleteAll = async () => {
    if (deleting.current) return;

    deleting.current = true;
    setIsDeleting(true);
    setFailure(undefined);

    const deletedIds: string[] = [];

    for (const group of inGroupsOf(ideas, GROUP_SIZE)) {
      const results = await Promise.allSettled(
        group.map((idea) => deleteIdea(idea.id))
      );
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') deletedIds.push(group[index].id);
      });
    }

    if (deletedIds.length < ideas.length) {
      setFailure({
        action: 'delete',
        failed: ideas.length - deletedIds.length,
        total: ideas.length,
      });
    }

    invalidateAfterIdeaDelete(queryClient, deletedIds);
    deleting.current = false;
    setIsDeleting(false);
    onDeleted(deletedIds);
  };

  return {
    setStatus,
    assign,
    toggleTag,
    copyToPhase,
    deleteAll,
    isDeleting,
    failure,
  };
};

export default useBatchActions;
