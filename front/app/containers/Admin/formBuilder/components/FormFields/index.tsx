import React from 'react';
import { DndProvider } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';
import { useFormContext } from 'react-hook-form';
import { snakeCase } from 'lodash-es';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import { List, SortableRow } from 'components/admin/ResourceList';
import { Box, Badge, Text } from '@citizenlab/cl2-component-library';
import T from 'components/T';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// Hooks
import useLocale from 'hooks/useLocale';

import {
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'services/formCustomFields';

const StyledBadge = styled(Badge)`
  margin-left: 12px;
`;

// Assign field badge text
const getTranslatedFieldType = (field) => {
  switch (field) {
    case 'text':
      return messages.shortAnswer;
    case 'multiselect':
    case 'select':
      return messages.multipleChoice;
    case 'number':
      return messages.number;
    case 'linear_scale':
      return messages.linearScale;
    default:
      return messages.default;
  }
};

interface FormFieldsProps {
  onEditField: (field: IFlatCustomFieldWithIndex) => void;
  handleDragRow: (fromIndex: number, toIndex: number) => void;
  isEditingDisabled: boolean;
  selectedFieldId?: string;
}

const FormFields = ({
  onEditField,
  handleDragRow,
  selectedFieldId,
  isEditingDisabled,
}: FormFieldsProps) => {
  const {
    watch,
    formState: { errors },
  } = useFormContext();
  const formCustomFields: IFlatCustomField[] = watch('customFields');
  const locale = useLocale();
  if (isNilOrError(locale)) {
    return null;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <Box p="32px" height="100%" overflowY="auto">
        <List key={formCustomFields.length}>
          {formCustomFields.map((field, index) => {
            const hasErrors = !!errors.customFields?.[index];
            let outlineStyle = 'none';
            if (hasErrors) {
              outlineStyle = `1px solid ${colors.error}`;
            } else if (selectedFieldId === field.id) {
              outlineStyle = `1px solid ${colors.primary}`;
            }
            const fieldIdentifier = snakeCase(field.title_multiloc[locale]);

            return (
              <Box
                key={field.id}
                style={{ outline: outlineStyle }}
                data-cy={`e2e-field-${fieldIdentifier}`}
              >
                <SortableRow
                  id={field.id}
                  index={index}
                  moveRow={handleDragRow}
                  dropRow={() => {
                    // Do nothing, no need to handle dropping a row for now
                  }}
                >
                  <Box display="flex" className="expand">
                    <Box as="span" display="flex" alignItems="center">
                      <Text fontSize="base" my="0px" color="primary">
                        <T value={field.title_multiloc} />
                      </Text>
                    </Box>
                    {!isNilOrError(field.input_type) && (
                      <StyledBadge className="inverse" color={colors.grey700}>
                        <FormattedMessage
                          {...getTranslatedFieldType(field.input_type)}
                        />
                      </StyledBadge>
                    )}
                    {field.required && (
                      <StyledBadge className="inverse" color={colors.error}>
                        <FormattedMessage {...messages.required} />
                      </StyledBadge>
                    )}
                  </Box>
                  <Button
                    buttonStyle="secondary"
                    icon="edit"
                    disabled={isEditingDisabled}
                    onClick={() => {
                      onEditField({ ...field, index });
                    }}
                    data-cy={`e2e-edit-${fieldIdentifier}`}
                  >
                    <FormattedMessage {...messages.editButtonLabel} />
                  </Button>
                </SortableRow>
              </Box>
            );
          })}
        </List>
        {formCustomFields.length > 0 && (
          <Box height="1px" borderTop={`1px solid ${colors.divider}`} />
        )}
      </Box>
    </DndProvider>
  );
};

export default FormFields;
