import React, { useState } from 'react';

import { Key } from 'react-aria-components';

import AlertDialog from 'design-system/AlertDialog';
import Button from 'design-system/Button';
import { ListBoxOption } from 'design-system/ListBox';
import { MenuTrigger } from 'design-system/Menu';
import { DialogTrigger } from 'design-system/Popover';
import SelectionBar from 'design-system/SelectionBar';
import TagPicker from 'design-system/TagPicker';

import { IIdeaData } from 'api/ideas/types';

import { ManagerType } from 'components/admin/PostManager';
import actionBarMessages from 'components/admin/PostManager/components/ActionBar/messages';
import useAssigneeOptions, {
  UNASSIGNED,
} from 'components/admin/PostManager/useAssigneeOptions';
import warningModalMessages from 'components/WarningModal/messages';

import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import messages from '../messages';
import OptionList from '../OptionList';
import usePickerOptions from '../usePickerOptions';
import { phaseIds, topicIds } from '../utils';

import StatusPicker from './StatusPicker';
import useBatchActions from './useBatchActions';

interface Props {
  type: ManagerType;
  projectId: string;
  ideas: IIdeaData[];
  onUpdated: (idea: IIdeaData) => void;
  onEdit: (ideaId: string) => void;
  onClear: () => void;
}

const shared = (ideas: IIdeaData[], values: (idea: IIdeaData) => string[]) =>
  ideas.length === 0
    ? []
    : values(ideas[0]).filter((value) =>
        ideas.every((idea) => values(idea).includes(value))
      );

const BatchBar = ({
  type,
  projectId,
  ideas,
  onUpdated,
  onEdit,
  onClear,
}: Props) => {
  const { formatMessage } = useIntl();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [phaseMenuOpen, setPhaseMenuOpen] = useState(false);
  const { statusOptions, tagOptions, phaseOptions } = usePickerOptions(
    type,
    projectId
  );
  const assigneeOptions = useAssigneeOptions(projectId, getFullName);
  const { setStatus, assign, toggleTag, copyToPhase, deleteAll, isDeleting } =
    useBatchActions({
      ideas,
      onUpdated,
      onDeleted: () => {
        setDeleteModalOpen(false);
        onClear();
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
      .forEach(toggleTag);
  };

  return (
    <>
      <SelectionBar count={ideas.length} onClearSelection={onClear}>
        <StatusPicker
          options={statusOptions}
          selected={shared(ideas, statusIds)}
          onSelect={setStatus}
        />

        <MenuTrigger>
          <Button size={28} icon="user-16">
            {formatMessage(messages.batchAssign)}
          </Button>
          <OptionList
            aria-label={formatMessage(messages.batchAssign)}
            options={assigneeOptions}
            selected={shared(ideas, assigneeIds)}
            onToggle={assign}
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
                onToggle={(phaseId) => {
                  copyToPhase(phaseId);
                  setPhaseMenuOpen(false);
                }}
              />
            </MenuTrigger>
          ) : (
            <Button
              size={28}
              icon="arrow-right-16"
              disabledReason={formatMessage(messages.noOtherPhases)}
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
          onPress={() => setDeleteModalOpen(true)}
        >
          {isSingle
            ? formatMessage(messages.delete)
            : formatMessage(actionBarMessages.deleteAllSelectedInputs, {
                count: ideas.length,
              })}
        </Button>
      </SelectionBar>

      <AlertDialog
        isOpen={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        isPending={isDeleting}
        title={formatMessage(
          isSingle
            ? warningModalMessages.deleteInputTitle
            : actionBarMessages.deleteInputsTitle
        )}
        confirmLabel={formatMessage(warningModalMessages.confirm)}
        onConfirm={deleteAll}
      >
        {formatMessage(
          isSingle
            ? warningModalMessages.deleteInputExplanation
            : actionBarMessages.deleteInputsExplanation
        )}
      </AlertDialog>
    </>
  );
};

export default BatchBar;
