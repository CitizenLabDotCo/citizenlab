import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';

// components
import { Box, colors } from '@citizenlab/cl2-component-library';
import MoreActionsMenu from 'components/UI/MoreActionsMenu';
import FieldTitle from './FieldTitle';
import Logic from './Logic';
import IconsAndBadges from './IconsAndBadges';
import { FlexibleRow } from '../../FlexibleRow';

// styling
import styled from 'styled-components';
import { rgba } from 'polished';

// utils
import { getFieldBackgroundColor } from '../utils';

// Translation
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// typings
import {
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
  IOptionsType,
} from 'api/custom_fields/types';
import { FormBuilderConfig } from 'components/FormBuilder/utils';
import { generateTempId } from '../../FormBuilderSettings/utils';

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
  onDelete: (fieldIndex: number) => void;
  isDeleteDisabled: boolean;
};

export const FormField = ({
  field,
  onEditField,
  selectedFieldId,
  builderConfig,
  fieldNumbers,
  onDelete,
  isDeleteDisabled,
}: Props) => {
  const {
    watch,
    formState: { errors },
    trigger,
  } = useFormContext();
  const { formatMessage } = useIntl();
  const formCustomFields: IFlatCustomField[] = watch('customFields');
  const index = formCustomFields.findIndex((f) => f.id === field.id);
  const { insert } = useFieldArray({
    name: 'customFields',
  });
  const { formEndPageLogicOption, displayBuiltInFields, groupingType } =
    builderConfig;

  const hasErrors = !!errors.customFields?.[index];

  const showLogicOnRow =
    field.input_type !== 'page' ? field.logic.rules : field.logic;

  const isFieldGrouping = ['page', 'section'].includes(field.input_type);

  const editFieldAndValidate = () => {
    onEditField({ ...field, index });
    trigger();
  };

  function addCopyIndicatorToTitle(title_multiloc) {
    const copiedTitle_multiloc = {};
    Object.keys(title_multiloc).forEach((lang) => {
      const originalTitle = title_multiloc[lang];
      copiedTitle_multiloc[lang] =
        originalTitle !== ''
          ? `${originalTitle} (${formatMessage(messages.copy)})`
          : '';
    });
    return copiedTitle_multiloc;
  }

  function duplicateField(originalField: IFlatCustomField) {
    const {
      id,
      temp_id,
      logic,
      isLocalOnly,
      title_multiloc,
      key,
      code,
      options,
      ...rest
    } = originalField;

    let duplicatedOptions: IOptionsType[] = [];
    if (options) {
      duplicatedOptions = options.map(({ id, temp_id, ...rest }) => ({
        temp_id: generateTempId(),
        ...rest,
      }));
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
      isLocalOnly: true,
      title_multiloc: addCopyIndicatorToTitle(title_multiloc),
      ...rest,
    };

    return duplicatedField;
  }

  const actions = [
    ...(field.input_type !== groupingType
      ? [
          {
            handler: (event: React.MouseEvent) => {
              event.stopPropagation();
              const duplicatedField = duplicateField(field);
              insert(index + 1, duplicatedField);
              trigger();
            },
            label: formatMessage(messages.duplicate),
            icon: 'copy' as const,
          },
        ]
      : []),
    ...(!isDeleteDisabled
      ? [
          {
            handler: (event: React.MouseEvent) => {
              event.stopPropagation();
              onDelete(index);
            },
            label: formatMessage(messages.delete),
            icon: 'delete' as const,
          },
        ]
      : []),
  ];

  return (
    <FormFieldsContainer
      role={'button'}
      key={field.id}
      background={getFieldBackgroundColor(selectedFieldId, field, hasErrors)}
      onClick={() => {
        editFieldAndValidate();
      }}
      data-cy="e2e-field-row"
    >
      <FlexibleRow rowHeight={isFieldGrouping ? '50px' : '70px'}>
        <Box
          display="flex"
          justifyContent="space-between"
          className="expand"
          width="100%"
          ml={isFieldGrouping ? '8px' : '32px'}
        >
          <Box display="flex" alignItems="center" height="100%">
            <Box display="block">
              <FieldTitle
                hasErrors={hasErrors}
                field={field}
                fieldNumber={fieldNumbers[field.id]}
              />
              {showLogicOnRow && (
                <Logic
                  field={field}
                  formCustomFields={formCustomFields}
                  fieldNumbers={fieldNumbers}
                  formEndPageLogicOption={formEndPageLogicOption}
                />
              )}
            </Box>
          </Box>
          <IconsAndBadges
            field={field}
            displayBuiltInFields={displayBuiltInFields}
          />
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
            />
          </Box>
        </Box>
      </FlexibleRow>
    </FormFieldsContainer>
  );
};
