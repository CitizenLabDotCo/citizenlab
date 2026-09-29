import React, { useState } from 'react';

import {
  Box,
  Button,
  colors,
  IconButton,
  Text,
} from '@citizenlab/cl2-component-library';

import { IIdeaData } from 'api/ideas/types';

import { ManagerType } from 'components/admin/PostManager';
import actionBarMessages from 'components/admin/PostManager/components/ActionBar/messages';
import WarningModal from 'components/WarningModal';
import warningModalMessages from 'components/WarningModal/messages';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import OptionList from '../OptionList';
import useAssigneeOptions, { UNASSIGNED } from '../useAssigneeOptions';
import usePickerOptions from '../usePickerOptions';
import { phaseIds, topicIds } from '../utils';

import BatchMenuButton from './BatchMenuButton';
import useBatchActions from './useBatchActions';

interface Props {
  type: ManagerType;
  projectId: string;
  ideas: IIdeaData[];
  onUpdated: (idea: IIdeaData) => void;
  onEdit: (ideaId: string) => void;
  onClear: () => void;
}

/** The values every selected input shares. */
const shared = (ideas: IIdeaData[], values: (idea: IIdeaData) => string[]) =>
  ideas.length === 0
    ? []
    : values(ideas[0]).filter((value) =>
        ideas.every((idea) => values(idea).includes(value))
      );

/** The values some, but not all, selected inputs have. */
const partial = (ideas: IIdeaData[], values: (idea: IIdeaData) => string[]) => {
  const all = shared(ideas, values);
  return [...new Set(ideas.flatMap(values))].filter(
    (value) => !all.includes(value)
  );
};

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
  const { statusOptions, tagOptions, phaseOptions } = usePickerOptions(
    type,
    projectId
  );
  const assigneeOptions = useAssigneeOptions(projectId);
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
  const partialTags = partial(ideas, topicIds);
  const isSingle = ideas.length === 1;

  return (
    <Box display="flex" alignItems="center" gap="8px" flexWrap="wrap">
      <Text m="0" mr="4px" fontSize="s" fontWeight="semi-bold">
        {formatMessage(messages.selectedCount, { count: ideas.length })}
      </Text>

      <BatchMenuButton
        icon="check-circle"
        label={formatMessage(messages.batchStatus)}
        width="280px"
      >
        {(close) => (
          <>
            <OptionList
              options={statusOptions}
              selected={shared(ideas, statusIds)}
              onToggle={(statusId) => {
                setStatus(statusId);
                close();
              }}
            />
            <Text m="8px" fontSize="xs" color="coolGrey600">
              {formatMessage(messages.statusChangeNotifies)}
            </Text>
          </>
        )}
      </BatchMenuButton>

      <BatchMenuButton icon="user" label={formatMessage(messages.batchAssign)}>
        {(close) => (
          <OptionList
            options={assigneeOptions}
            selected={shared(ideas, assigneeIds)}
            searchable={assigneeOptions.length > 8}
            onToggle={(assigneeId) => {
              assign(assigneeId);
              close();
            }}
          />
        )}
      </BatchMenuButton>

      <BatchMenuButton icon="label" label={formatMessage(messages.batchTags)}>
        {() => (
          <OptionList
            options={tagOptions.map((option) => ({
              ...option,
              partial: partialTags.includes(option.value),
            }))}
            selected={shared(ideas, topicIds)}
            searchable
            onToggle={toggleTag}
          />
        )}
      </BatchMenuButton>

      {type === 'ProjectIdeas' && (
        <BatchMenuButton
          icon="arrow-right"
          label={formatMessage(messages.copyToPhase)}
          width="280px"
        >
          {(close) =>
            phaseOptions.length > 0 ? (
              <OptionList
                options={phaseOptions.map((option) => ({
                  ...option,
                  disabled: sharedPhases.includes(option.value),
                }))}
                selected={sharedPhases}
                onToggle={(phaseId) => {
                  copyToPhase(phaseId);
                  close();
                }}
              />
            ) : (
              <Text m="8px" fontSize="s" color="coolGrey600">
                {formatMessage(messages.noOtherPhases)}
              </Text>
            )
          }
        </BatchMenuButton>
      )}

      {isSingle && (
        <Button
          buttonStyle="secondary-outlined"
          size="s"
          padding="4px 10px"
          icon="edit"
          iconSize="16px"
          onClick={() => onEdit(ideas[0].id)}
        >
          {formatMessage(messages.edit)}
        </Button>
      )}

      <Button
        buttonStyle="delete"
        size="s"
        padding="4px 10px"
        icon="delete"
        iconSize="16px"
        onClick={() => setDeleteModalOpen(true)}
      >
        {isSingle
          ? formatMessage(messages.delete)
          : formatMessage(actionBarMessages.deleteAllSelectedInputs, {
              count: ideas.length,
            })}
      </Button>

      <IconButton
        iconName="close"
        iconWidth="18px"
        iconHeight="18px"
        iconColor={colors.coolGrey600}
        iconColorOnHover={colors.textPrimary}
        a11y_buttonActionMessage={formatMessage(messages.clearSelection)}
        onClick={onClear}
      />

      <WarningModal
        open={deleteModalOpen}
        isLoading={isDeleting}
        title={formatMessage(
          isSingle
            ? warningModalMessages.deleteInputTitle
            : actionBarMessages.deleteInputsTitle
        )}
        explanation={formatMessage(
          isSingle
            ? warningModalMessages.deleteInputExplanation
            : actionBarMessages.deleteInputsExplanation
        )}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={deleteAll}
      />
    </Box>
  );
};

export default BatchBar;
