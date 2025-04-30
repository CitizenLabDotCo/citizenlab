import React, { useState, useRef } from 'react';

import {
  Box,
  Title,
  Text,
  colors,
  Button,
  Badge,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { rgba } from 'polished';
import { useFormContext, useFieldArray } from 'react-hook-form';
import styled from 'styled-components';

import {
  ICustomFieldSettingsTab,
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
  IMatrixStatementsType,
  IOptionsType,
} from 'api/custom_fields/types';
import useDuplicateMapConfig from 'api/map_config/useDuplicateMapConfig';

import { Conflict } from 'components/FormBuilder/edit/utils';
import {
  FormBuilderConfig,
  builtInFieldKeys,
} from 'components/FormBuilder/utils';
import Modal from 'components/UI/Modal';
import MoreActionsMenu from 'components/UI/MoreActionsMenu';

import { useIntl } from 'utils/cl-intl';
import { generateTempId } from 'utils/helperUtils';

import { FlexibleRow } from '../../FlexibleRow';
import { getFieldBackgroundColor } from '../utils';

import FieldTitle from './FieldTitle';
import IconsAndBadges from './IconsAndBadges';
import Logic from './Logic';
import messages from './messages';
import { getConflictMessageKey } from './utils';

const FormFieldsContainer = styled(Box)`
  &:hover {
    cursor: pointer;
    background: ${rgba(colors.tealLight, 0.2)};
  }
`;

type Props = {
  field: IFlatCustomField;
  onEditField: (field: IFlatCustomFieldWithIndex) => void;
  selectedFieldId?: string;
  builderConfig: FormBuilderConfig;
  fieldNumbers: Record<string, number>;
  closeSettings: (triggerAutosave?: boolean) => void;
  conflicts?: Conflict[];
  hasFullPageRestriction: boolean;
};

export const FormField = ({
  field,
  onEditField,
  selectedFieldId,
  builderConfig,
  fieldNumbers,
  closeSettings,
  conflicts,
  hasFullPageRestriction,
}: Props) => {
  const {
    watch,
    formState: { errors },
    trigger,
    setValue,
  } = useFormContext();
  const moreActionsButtonRef = useRef<HTMLButtonElement>(null);
  const { formatMessage } = useIntl();
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const lockedAttributes = field?.constraints?.locks;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const formCustomFields: IFlatCustomField[] = watch('customFields');
  const index = formCustomFields.findIndex((f) => f.id === field.id);
  const { insert, move, remove } = useFieldArray({
    name: 'customFields',
  });
  const { formEndPageLogicOption, displayBuiltInFields } = builderConfig;
  const { mutateAsync: duplicateMapConfig } = useDuplicateMapConfig();

  const hasErrors = !!errors.customFields?.[index];
  const message = getConflictMessageKey(conflicts);

  // NOTE: We always show the default page logic on a page field
  const showLogicOnRow = field.input_type !== 'page' ? field.logic.rules : true;
  const isFieldGrouping = field.input_type === 'page';

  // Group is only deletable when we have more than one group
  const getGroupDeletable = () => {
    const groupFields = formCustomFields.filter(
      (field) => field.input_type === 'page'
    );

    return builderConfig.type === 'survey'
      ? groupFields.length > 2
      : groupFields.length > 1;
  };

  const isGroupDeletable = getGroupDeletable();
  const shouldShowDelete = !(
    (field.input_type === 'page' && !isGroupDeletable) ||
    get(lockedAttributes, 'enabled', false) ||
    hasFullPageRestriction
  );

  const editFieldAndValidate = (defaultTab: ICustomFieldSettingsTab) => {
    onEditField({ ...field, index, defaultTab });
    trigger();
  };

  function addCopyIndicatorToTitle(title_multiloc) {
    const copiedTitle_multiloc = {};
    Object.keys(title_multiloc).forEach((lang) => {
      const originalTitle = title_multiloc[lang];
      copiedTitle_multiloc[lang] =
        originalTitle !== ''
          ? `${originalTitle} (${formatMessage(messages.copyNoun)})`
          : '';
    });
    return copiedTitle_multiloc;
  }

  const duplicateField = async (originalField: IFlatCustomField) => {
    const {
      id: _id,
      temp_id: _temp_id,
      logic: _logic,
      isLocalOnly: _isLocalOnly,
      title_multiloc: _title_multiloc,
      key: _key,
      code: _code,
      options,
      matrix_statements,
      ...rest
    } = originalField;

    let duplicatedOptions: IOptionsType[] = [];
    if (options) {
      duplicatedOptions = options.map(
        ({ id: _optionId, temp_id: _optionalTempId, ...rest }) => ({
          temp_id: generateTempId(),
          ...rest,
        })
      );
    }

    let duplicatedStatements: IMatrixStatementsType[] = [];
    if (matrix_statements) {
      duplicatedStatements = matrix_statements.map(
        ({ id: _statementId, temp_id: _optionalTempId, ...rest }) => ({
          temp_id: generateTempId(),
          ...rest,
        })
      );
    }

    const duplicatedField = {
      id: `${Math.floor(Date.now() * Math.random())}`,
      temp_id: generateTempId(),
      logic: {
        ...(originalField.input_type !== 'page' ? { rules: [] } : undefined),
      },
      ...(duplicatedOptions.length > 0
        ? { options: duplicatedOptions }
        : undefined),
      ...(duplicatedStatements.length > 0
        ? { matrix_statements: duplicatedStatements }
        : undefined),
      isLocalOnly: true,
      title_multiloc: addCopyIndicatorToTitle(_title_multiloc),
      ...rest,
    };

    // Duplicate the map config if this is a mapping question
    if (
      originalField.input_type === 'point' &&
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      originalField.map_config?.data?.id
    ) {
      const newMapConfig = await duplicateMapConfig(
        originalField.map_config.data.id
      );

      duplicatedField.mapConfig = newMapConfig;
      duplicatedField.map_config_id = newMapConfig.data.id;
    }

    return duplicatedField;
  };

  const onDelete = (fieldIndex: number) => {
    if (builtInFieldKeys.includes(field.key)) {
      const newField = { ...field, enabled: false };
      setValue(`customFields.${index}`, newField);
    } else {
      const field = formCustomFields[fieldIndex];

      // When the first group is deleted, it's questions go to the next group
      if (fieldIndex === 0 && field.input_type === 'page') {
        const nextGroupIndex = formCustomFields.findIndex(
          (field, fieldIndex) => field.input_type === 'page' && fieldIndex !== 0
        );
        move(nextGroupIndex, 0);
        remove(1);
      } else {
        remove(fieldIndex);
      }
    }
    closeSettings(false);
    trigger();
  };

  const closeModal = () => {
    setShowDeleteModal(false);
  };
  const openModal = () => {
    setShowDeleteModal(true);
  };

  const deleteField = (fieldIndex: number) => {
    // Check if deleted field has linked logic
    const doesPageHaveLinkedLogic = formCustomFields.some((formField) => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (formField.logic && formField.logic.rules) {
        return formField.logic.rules.some(
          (rule) =>
            rule.goto_page_id === field.id ||
            rule.goto_page_id === field.temp_id
        );
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      } else if (formField.logic && formField.logic?.next_page_id) {
        return (
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          formField.logic?.next_page_id === field.id || // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          formField.logic?.next_page_id === field.temp_id
        );
      }
      return false;
    });

    if (doesPageHaveLinkedLogic) {
      openModal();
    } else {
      onDelete(fieldIndex);
    }
  };

  const removeLogicAndDelete = () => {
    formCustomFields.map((formField, i) => {
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (formField.logic && formField.logic.rules) {
        const updatedRules = formField.logic.rules.filter(
          (rule) =>
            rule.goto_page_id !== field.id &&
            rule.goto_page_id !== field.temp_id
        );
        setValue(`customFields.${i}.logic.rules`, updatedRules);
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      } else if (formField.logic && formField.logic.next_page_id) {
        if (
          formField.logic.next_page_id === field.id ||
          formField.logic.next_page_id === field.temp_id
        ) {
          setValue(`customFields.${i}.logic`, {});
        }
      }
    });

    onDelete(index);
  };

  const actions = [
    ...(field.input_type !== 'page' && !field.code // Do not copy built-in fields
      ? [
          {
            handler: async (event: React.MouseEvent) => {
              event.stopPropagation();
              const duplicatedField = await duplicateField(field);
              insert(index + 1, duplicatedField);
              trigger();
            },
            label: formatMessage(messages.copyVerb),
            icon: 'copy' as const,
          },
        ]
      : []),
    ...(shouldShowDelete
      ? [
          {
            handler: (event: React.MouseEvent) => {
              event.stopPropagation();
              deleteField(index);
            },
            label: formatMessage(messages.delete),
            icon: 'delete' as const,
          },
        ]
      : []),
  ];

  return (
    <>
      <FormFieldsContainer
        role={'button'}
        key={field.id}
        background={getFieldBackgroundColor(selectedFieldId, field, hasErrors)}
        onClick={() => {
          editFieldAndValidate('content');
        }}
        data-cy="e2e-field-row"
      >
        <FlexibleRow rowHeight={isFieldGrouping ? '50px' : '70px'}>
          <Box
            display="flex"
            justifyContent="space-between"
            className="expand"
            width="100%"
            h="100%"
            alignItems="center"
            flexWrap="wrap"
            ml={isFieldGrouping ? '8px' : '32px'}
          >
            <Box display="flex" alignItems="center" height="100%" flex="2">
              <Box display="block">
                <FieldTitle
                  hasErrors={hasErrors}
                  field={field}
                  fieldNumber={fieldNumbers[field.id]}
                  hasFullPageRestriction={hasFullPageRestriction}
                />
              </Box>
            </Box>
            <Box
              flex="1"
              display="flex"
              justifyContent="flex-end"
              alignItems="center"
            >
              {message && (
                <Tooltip content={formatMessage(message)} theme="dark">
                  <Box>
                    <Badge color={colors.orange500} className="inverse">
                      {formatMessage(messages.conflictingLogic)}
                    </Badge>
                  </Box>
                </Tooltip>
              )}
              <IconsAndBadges
                field={field}
                displayBuiltInFields={displayBuiltInFields}
              />
            </Box>
          </Box>
          {field.key !== 'form_end' && (
            <Box
              mr="32px"
              ml="12px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              h="100%"
            >
              <MoreActionsMenu
                showLabel={false}
                color={colors.textSecondary}
                actions={actions}
                onClick={(event) => event.stopPropagation()}
                data-cy="e2e-more-field-actions"
                ref={moreActionsButtonRef}
              />
            </Box>
          )}
        </FlexibleRow>
        {showLogicOnRow && builderConfig.isLogicEnabled && (
          <Logic
            field={field}
            formCustomFields={formCustomFields}
            fieldNumbers={fieldNumbers}
            formEndPageLogicOption={formEndPageLogicOption}
            handleOpenSettings={editFieldAndValidate}
          />
        )}
      </FormFieldsContainer>
      <Modal
        opened={showDeleteModal}
        close={closeModal}
        returnFocusRef={moreActionsButtonRef}
      >
        <Box display="flex" flexDirection="column" width="100%" p="20px">
          <Box mb="40px">
            <Title variant="h3" color="primary">
              {formatMessage(messages.deleteFieldWithLogicConfirmationQuestion)}
            </Title>
            <Text color="primary" fontSize="l">
              {formatMessage(messages.deleteResultsInfo)}
            </Text>
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            width="100%"
            alignItems="center"
          >
            <Button
              icon="delete"
              data-cy="e2e-confirm-delete-page-and-logic"
              buttonStyle="delete"
              width="auto"
              mr="20px"
              onClick={removeLogicAndDelete}
            >
              {formatMessage(messages.confirmDeleteFieldWithLogicButtonText)}
            </Button>
            <Button
              buttonStyle="secondary-outlined"
              width="auto"
              onClick={closeModal}
            >
              {formatMessage(messages.cancelDeleteButtonText)}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};
