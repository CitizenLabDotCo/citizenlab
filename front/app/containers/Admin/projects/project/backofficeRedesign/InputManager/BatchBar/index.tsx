import React, { useState } from 'react';

import AlertDialog from 'design-system/AlertDialog';
import Button from 'design-system/Button';
import { ListBoxOption } from 'design-system/ListBox';
import { MenuTrigger } from 'design-system/Menu';
import { DialogTrigger } from 'design-system/Popover';
import SelectionBar from 'design-system/SelectionBar';
import TagPicker from 'design-system/TagPicker';
import { Key } from 'design-system/types';

import { IIdeaData } from 'api/ideas/types';
import useAuthUser from 'api/me/useAuthUser';

import { ManagerType } from 'components/admin/PostManager';
import useAssigneeOptions, {
  UNASSIGNED,
} from 'components/admin/PostManager/useAssigneeOptions';
import warningModalMessages from 'components/WarningModal/messages';

import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import messages from '../messages';
import OptionList, { Option } from '../OptionList';
import useInputTermLabels from '../useInputTermLabels';
import usePickerOptions from '../usePickerOptions';
import { phaseIds, topicIds } from '../utils';

import SelectAllButton from './SelectAllButton';
import StatusPicker from './StatusPicker';
import useBatchActions, { BatchAttribute } from './useBatchActions';
import { BatchFeedback } from './useBatchFeedback';

interface Props {
  type: ManagerType;
  projectId: string;
  ideas: IIdeaData[];
  /** How many inputs match the current filters, on every page. */
  total: number | undefined;
  onUpdated: (ideas: IIdeaData[], attribute: BatchAttribute) => void;
  onFeedback: (feedback: BatchFeedback) => void;
  onEdit: (ideaId: string) => void;
  onClear: () => void;
  onDeleted: (ideaIds: string[]) => void;
  onSelectAll: () => void;
  isSelectingAll: boolean;
  selectAllFailed: boolean;
}

const shared = (ideas: IIdeaData[], values: (idea: IIdeaData) => string[]) =>
  ideas.length === 0
    ? []
    : values(ideas[0]).filter((value) =>
        ideas.every((idea) => values(idea).includes(value))
      );

// The pickers report a value; the status line names what was picked.
const withLabel =
  (options: Option[], action: (value: string, label: string) => void) =>
  (value: string) => {
    const option = options.find((candidate) => candidate.value === value);
    if (option) action(value, option.label);
  };

const BatchBar = ({
  type,
  projectId,
  ideas,
  total,
  onUpdated,
  onFeedback,
  onEdit,
  onClear,
  onDeleted,
  onSelectAll,
  isSelectingAll,
  selectAllFailed,
}: Props) => {
  const { formatMessage } = useIntl();
  const { inputTerm, term, terms, termCount } = useInputTermLabels();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [phaseMenuOpen, setPhaseMenuOpen] = useState(false);
  const { statusOptions, tagOptions, phaseOptions } = usePickerOptions(
    type,
    projectId
  );
  const assigneeOptions = useAssigneeOptions(projectId, getFullName);
  const { data: authUser } = useAuthUser();
  const { setStatus, assign, toggleTag, copyToPhase, deleteAll, isDeleting } =
    useBatchActions({
      ideas,
      inputTerm,
      onFeedback,
      onUpdated,
      onDeleted: (ideaIds) => {
        setDeleteModalOpen(false);
        onDeleted(ideaIds);
      },
    });

  const statusIds = (idea: IIdeaData) => {
    const id = idea.relationships.idea_status.data?.id;
    return id ? [id] : [];
  };
  const assigneeIds = (idea: IIdeaData) => [
    idea.relationships.assignee?.data?.id ?? UNASSIGNED,
  ];
  const sharedPhases = shared(ideas, phaseIds);
  const sharedTags = shared(ideas, topicIds);
  const isSingle = ideas.length === 1;

  // The picker reports the whole new selection; each tag that changed is toggled.
  const handleTagsChange = (keys: Set<Key>) => {
    tagOptions
      .map((option) => option.value)
      .filter((tagId) => keys.has(tagId) !== sharedTags.includes(tagId))
      .forEach(withLabel(tagOptions, toggleTag));
  };

  return (
    <>
      <SelectionBar count={ideas.length} onClearSelection={onClear}>
        {total !== undefined && ideas.length < total && (
          <SelectAllButton
            label={formatMessage(messages.selectAllTerms, {
              termCount: termCount(total),
            })}
            processing={isSelectingAll}
            failed={selectAllFailed}
            onClick={onSelectAll}
          />
        )}

        <StatusPicker
          options={statusOptions}
          selected={shared(ideas, statusIds)}
          onSelect={withLabel(statusOptions, setStatus)}
        />

        <MenuTrigger>
          <Button size={28} icon="user-16">
            {formatMessage(messages.batchAssign)}
          </Button>
          <OptionList
            aria-label={formatMessage(messages.batchAssign)}
            options={assigneeOptions}
            selected={shared(ideas, assigneeIds)}
            onToggle={withLabel(assigneeOptions, (assigneeId, name) =>
              assign(assigneeId, {
                name,
                isCurrentUser: assigneeId === authUser?.data.id,
              })
            )}
            selectionMode="single"
          />
        </MenuTrigger>

        <DialogTrigger>
          <Button size={28} icon="tag-16">
            {formatMessage(messages.batchTags)}
          </Button>
          <TagPicker
            aria-label={formatMessage(messages.batchTags)}
            items={tagOptions.map((option) => ({
              id: option.value,
              label: option.label,
            }))}
            selectedKeys={new Set(sharedTags)}
            onSelectionChange={handleTagsChange}
          >
            {(tag) => <ListBoxOption id={tag.id}>{tag.label}</ListBoxOption>}
          </TagPicker>
        </DialogTrigger>

        {type === 'ProjectIdeas' &&
          (phaseOptions.length > 0 ? (
            <MenuTrigger isOpen={phaseMenuOpen} onOpenChange={setPhaseMenuOpen}>
              <Button size={28} icon="arrow-right-16">
                {formatMessage(messages.copyToPhase)}
              </Button>
              <OptionList
                aria-label={formatMessage(messages.copyToPhase)}
                options={phaseOptions.map((option) => ({
                  ...option,
                  disabled: sharedPhases.includes(option.value),
                }))}
                selected={sharedPhases}
                onToggle={withLabel(phaseOptions, (phaseId, phaseLabel) => {
                  copyToPhase(phaseId, phaseLabel);
                  setPhaseMenuOpen(false);
                })}
              />
            </MenuTrigger>
          ) : (
            <Button
              size={28}
              icon="arrow-right-16"
              disabledReason={formatMessage(messages.noOtherPhasesForTerms, {
                terms,
              })}
            >
              {formatMessage(messages.copyToPhase)}
            </Button>
          ))}

        {isSingle && (
          <Button
            size={28}
            icon="square-pen-16"
            onPress={() => onEdit(ideas[0].id)}
          >
            {formatMessage(messages.edit)}
          </Button>
        )}

        <Button
          variant="danger"
          size={28}
          icon="trash-2-16"
          aria-label={
            isSingle
              ? formatMessage(messages.delete)
              : formatMessage(messages.deleteTerms, {
                  termCount: termCount(ideas.length),
                })
          }
          onPress={() => setDeleteModalOpen(true)}
        />

      </SelectionBar>

      <AlertDialog
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        isPending={isDeleting}
        title={
          isSingle
            ? formatMessage(messages.deleteTermTitle, { term })
            : formatMessage(messages.deleteTermsTitle2, {
                termCount: termCount(ideas.length),
              })
        }
        confirmLabel={formatMessage(warningModalMessages.confirm)}
        onConfirm={deleteAll}
      >
        {isSingle
          ? formatMessage(messages.deleteTermExplanation, { term })
          : formatMessage(messages.deleteTermsExplanation, { terms })}
      </AlertDialog>
    </>
  );
};

export default BatchBar;
