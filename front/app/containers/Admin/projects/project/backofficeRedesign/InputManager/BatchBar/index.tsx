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
import useAssigneeOptions, {
  UNASSIGNED,
} from 'components/admin/PostManager/useAssigneeOptions';
import WarningModal from 'components/WarningModal';

import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import messages from '../messages';
import OptionList from '../OptionList';
import useInputTermLabels from '../useInputTermLabels';
import usePickerOptions from '../usePickerOptions';
import { phaseIds, topicIds } from '../utils';

import BatchMenuButton from './BatchMenuButton';
import SelectAllButton from './SelectAllButton';
import useBatchActions from './useBatchActions';

interface Props {
  type: ManagerType;
  projectId: string;
  ideas: IIdeaData[];
  /** How many inputs match the current filters, on every page. */
  total: number | undefined;
  onUpdated: (idea: IIdeaData) => void;
  onEdit: (ideaId: string) => void;
  onClear: () => void;
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
  total,
  onUpdated,
  onEdit,
  onClear,
  onSelectAll,
  isSelectingAll,
  selectAllFailed,
}: Props) => {
  const { formatMessage } = useIntl();
  const { term, terms, termCount } = useInputTermLabels();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
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
  const partialTags = partial(ideas, topicIds);
  const isSingle = ideas.length === 1;

  return (
    <Box display="flex" alignItems="center" gap="8px" flexWrap="wrap">
      <Text variant="boSection" m="0" mr="4px">
        {formatMessage(messages.selectedCount, { count: ideas.length })}
      </Text>

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
            <Text variant="boMicro" m="8px">
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
              <Text variant="boHelper" m="8px">
                {formatMessage(messages.noOtherPhasesForTerms, { terms })}
              </Text>
            )
          }
        </BatchMenuButton>
      )}

      {isSingle && (
        <Button
          buttonStyle="bo-secondary"
          icon="edit"
          onClick={() => onEdit(ideas[0].id)}
        >
          {formatMessage(messages.edit)}
        </Button>
      )}

      <Button
        buttonStyle="bo-delete"
        icon="delete"
        onClick={() => setDeleteModalOpen(true)}
      >
        {isSingle
          ? formatMessage(messages.delete)
          : formatMessage(messages.deleteTerms, {
              termCount: termCount(ideas.length),
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
        title={
          isSingle
            ? formatMessage(messages.deleteTermTitle, { term })
            : formatMessage(messages.deleteTermsTitle, { terms })
        }
        explanation={
          isSingle
            ? formatMessage(messages.deleteTermExplanation, { term })
            : formatMessage(messages.deleteTermsExplanation, { terms })
        }
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={deleteAll}
      />
    </Box>
  );
};

export default BatchBar;
