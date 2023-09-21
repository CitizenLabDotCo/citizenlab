import React from 'react';
import { useFormContext } from 'react-hook-form';

// components
import { Box, colors } from '@citizenlab/cl2-component-library';
import FieldTitle from './FieldTitle';
import Logic from './Logic';
import IconsAndBadges from './IconsAndBadges';
import { FlexibleRow } from '../../FlexibleRow';

// styling
import styled from 'styled-components';
import { rgba } from 'polished';

// utils
import { getFieldBackgroundColor } from '../utils';

// typings
import {
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'services/formCustomFields';
import { FormBuilderConfig } from 'components/FormBuilder/utils';

const FormFieldsContainer = styled(Box)`
  &:hover {
    cursor: pointer;
    background: ${rgba(colors.tealLight, 0.2)};
  }
`;

type Props = {
  field: IFlatCustomField;
  isEditingDisabled: boolean;
  onEditField: (field: IFlatCustomFieldWithIndex) => void;
  selectedFieldId?: string;
  builderConfig: FormBuilderConfig;
  fieldNumbers: Record<string, number>;
};

export const FormField = ({
  field,
  isEditingDisabled,
  onEditField,
  selectedFieldId,
  builderConfig,
  fieldNumbers,
}: Props) => {
  const {
    watch,
    formState: { errors },
    trigger,
  } = useFormContext();

  const formCustomFields: IFlatCustomField[] = watch('customFields');
  const index = formCustomFields.findIndex((f) => f.id === field.id);

  const hasErrors = !!errors.customFields?.[index];

  const showLogicOnRow =
    field.input_type !== 'page' ? field.logic.rules : field.logic;

  const isFieldGrouping = ['page', 'section'].includes(field.input_type);

  const editFieldAndValidate = () => {
    onEditField({ ...field, index });
    trigger();
  };

  return (
    <FormFieldsContainer
      role={'button'}
      key={field.id}
      background={getFieldBackgroundColor(selectedFieldId, field, hasErrors)}
      onClick={() => {
        isEditingDisabled ? undefined : editFieldAndValidate();
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
                  formEndPageLogicOption={builderConfig.formEndPageLogicOption}
                />
              )}
            </Box>
          </Box>
          <IconsAndBadges
            field={field}
            displayBuiltInFields={builderConfig.displayBuiltInFields}
          />
        </Box>
      </FlexibleRow>
    </FormFieldsContainer>
  );
};
