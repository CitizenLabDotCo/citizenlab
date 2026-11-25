import { useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { IIdea, IIdeaData, IIdeaUpdate } from 'api/ideas/types';
import { deleteIdea, invalidateAfterIdeaDelete } from 'api/ideas/useDeleteIdea';
import { invalidateAfterIdeaUpdate, updateIdea } from 'api/ideas/useUpdateIdea';

import tracks from 'components/admin/PostManager/tracks';
import { UNASSIGNED } from 'components/admin/PostManager/useAssigneeOptions';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { inGroupsOf } from 'utils/helperUtils';

import messages from '../messages';
import { phaseIds, topicIds } from '../utils';

import { BatchFeedback } from './useBatchFeedback';

// A selection can span every page, too many requests to send at once.
const GROUP_SIZE = 10;

export type BatchAttribute = 'status' | 'assignee' | 'tags' | 'phases';

export interface Assignee {
  name: string;
  isCurrentUser: boolean;
}

interface Copy {
  busy: string;
  done: (count: number) => string;
}

const useBatchActions = ({
  ideas,
  inputTerm,
  onFeedback,
  onUpdated,
  onDeleted,
}: {
  ideas: IIdeaData[];
  /** The phase's input term, or 'statement' in Common Ground. */
  inputTerm: string;
  onFeedback: (feedback: BatchFeedback) => void;
  onUpdated?: (ideas: IIdeaData[], attribute: BatchAttribute) => void;
  onDeleted: (ideaIds: string[]) => void;
}) => {
  const { formatMessage } = useIntl();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  // isDeleting only updates after a render, so a double click needs this.
  const deleting = useRef(false);

  const reportFailure = (
    message: typeof messages.batchUpdateFailed,
    failed: number,
    total: number
  ) =>
    onFeedback({
      state: 'failed',
      message: formatMessage(message, { failed, total }),
    });

  // The requests go out without their mutation hooks, so the cache refreshes
  // once for the whole batch rather than after every input.
  const updateEach = async (
    targets: IIdeaData[],
    attribute: BatchAttribute,
    requestBody: (idea: IIdeaData) => IIdeaUpdate,
    copy: Copy
  ) => {
    const updated: IIdea[] = [];
    onFeedback({ state: 'busy', message: copy.busy });

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
      reportFailure(
        messages.batchUpdateFailed,
        targets.length - updated.length,
        targets.length
      );
    } else {
      onFeedback({ state: 'done', message: copy.done(updated.length) });
    }
    if (updated.length === 0) return;

    invalidateAfterIdeaUpdate(queryClient, updated);
    onUpdated?.(
      updated.map((idea) => idea.data),
      attribute
    );
  };

  const setStatus = (statusId: string, statusLabel: string) => {
    const targets = ideas.filter(
      (idea) => idea.relationships.idea_status.data?.id !== statusId
    );
    if (targets.length === 0) return;

    updateEach(targets, 'status', () => ({ idea_status_id: statusId }), {
      busy: formatMessage(messages.batchUpdating, {
        inputTerm, count: targets.length,
      }),
      done: (count) =>
        formatMessage(messages.batchStatusDone, {
          inputTerm, count,
          status: statusLabel,
        }),
    });
    trackEventByName(tracks.ideaStatusChange, {
      location: 'Input manager',
      method: 'Batch action',
    });
  };

  const assign = (assigneeId: string, assignee: Assignee) => {
    const targets = ideas.filter(
      (idea) =>
        (idea.relationships.assignee?.data?.id ?? UNASSIGNED) !== assigneeId
    );
    if (targets.length === 0) return;

    const unassigning = assigneeId === UNASSIGNED;
    updateEach(
      targets,
      'assignee',
      () => ({ assignee_id: unassigning ? null : assigneeId }),
      {
        busy: formatMessage(
          unassigning ? messages.batchUnassigning : messages.batchAssigning,
          { inputTerm, count: targets.length }
        ),
        done: (count) => {
          if (unassigning) {
            return formatMessage(messages.batchUnassignedDone, {
              inputTerm,
              count,
            });
          }
          return assignee.isCurrentUser
            ? formatMessage(messages.batchAssignedToYouDone, {
                inputTerm,
                count,
              })
            : formatMessage(messages.batchAssignedDone, {
                inputTerm,
                count,
                assignee: assignee.name,
              });
        },
      }
    );
    trackEventByName(tracks.changeIdeaAssignment, {
      location: 'Input manager',
      method: 'Batch action',
    });
  };

  const toggleTag = (tagId: string, tagLabel: string) => {
    const withoutTag = ideas.filter((idea) => !topicIds(idea).includes(tagId));

    if (withoutTag.length === 0) {
      updateEach(
        ideas,
        'tags',
        (idea) => ({ topic_ids: topicIds(idea).filter((id) => id !== tagId) }),
        {
          busy: formatMessage(messages.batchTagRemoving, { tag: tagLabel }),
          done: (count) =>
            formatMessage(messages.batchTagRemovedDone, {
              tag: tagLabel,
              inputTerm, count,
            }),
        }
      );
    } else {
      updateEach(
        withoutTag,
        'tags',
        (idea) => ({ topic_ids: [...topicIds(idea), tagId] }),
        {
          busy: formatMessage(messages.batchTagAdding, { tag: tagLabel }),
          done: (count) =>
            formatMessage(messages.batchTagAddedDone, {
              tag: tagLabel,
              inputTerm, count,
            }),
        }
      );
    }
  };

  const copyToPhase = (phaseId: string, phaseLabel: string) => {
    const targets = ideas.filter((idea) => !phaseIds(idea).includes(phaseId));
    if (targets.length === 0) return;

    updateEach(
      targets,
      'phases',
      (idea) => ({ phase_ids: [...phaseIds(idea), phaseId] }),
      {
        busy: formatMessage(messages.batchCopying, {
          inputTerm, count: targets.length,
        }),
        done: (count) =>
          formatMessage(messages.batchCopiedDone, {
            inputTerm, count,
            phase: phaseLabel,
          }),
      }
    );
  };

  const deleteAll = async () => {
    if (deleting.current) return;

    deleting.current = true;
    setIsDeleting(true);
    onFeedback({
      state: 'busy',
      message: formatMessage(messages.batchDeleting, {
        inputTerm, count: ideas.length,
      }),
    });

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
      reportFailure(
        messages.batchDeleteFailed,
        ideas.length - deletedIds.length,
        ideas.length
      );
    } else {
      onFeedback({
        state: 'done',
        message: formatMessage(messages.batchDeletedDone, {
          inputTerm, count: deletedIds.length,
        }),
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
  };
};

export default useBatchActions;
