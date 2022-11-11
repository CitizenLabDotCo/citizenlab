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
import { List, SortableRow } from 'components/admin/ResourceList';
import { Box, Badge, Text, colors } from '@citizenlab/cl2-component-library';
import T from 'components/T';

// styling
import styled from 'styled-components';

// Hooks
import useLocale from 'hooks/useLocale';

import {
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'services/formCustomFields';

// Assign field badge text
const getTranslatedFieldType = (field) => {
  switch (field) {
    case 'text':
      return messages.shortAnswer;
    case 'multiselect':
    case 'select':
      return messages.multipleChoice;
    case 'page':
      return messages.page;
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
  const locale = useLocale();
  const formCustomFields: IFlatCustomField[] = watch('customFields');

  if (isNilOrError(locale)) {
    return null;
  }

  const FormFieldsContainer = styled(Box)`
    &:hover {
      cursor: pointer;
    }
  `;

  const isFieldSelected = (fieldId) => {
    return selectedFieldId === fieldId;
  };

  const getFieldBackgroundColor = (field) => {
    if (field.input_type === 'page') {
      return isFieldSelected(field.id) ? colors.primary : colors.background;
    }
    return undefined;
  };

  const getTitleColor = (field) => {
    if (field.input_type === 'page' && isFieldSelected(field.id)) {
      return 'white';
    }
    return 'grey800';
  };

  const getIndexTitleColor = (field) => {
    if (field.input_type === 'page' && isFieldSelected(field.id)) {
      return 'white';
    }
    return 'teal300';
  };

  const getIndexForTitle = (formCustomFields, field) => {
    if (field.input_type === 'page') {
      // Filter out questions
      const filteredPages = formCustomFields.filter(
        (customField) => customField.input_type === 'page'
      );
      // Return page title
      return ` ${filteredPages.indexOf(field) + 1}`;
    } else {
      // Filter out pages
      const filteredQuestion = formCustomFields.filter(
        (customField) => customField.input_type !== 'page'
      );
      // Return question title
      return ` ${filteredQuestion.indexOf(field) + 1}`;
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Box py="32px" height="100%" overflowY="auto">
        <List key={formCustomFields.length}>
          {formCustomFields.map((field, index) => {
            const hasErrors = !!errors.customFields?.[index];
            let outlineStyle = 'none';
            if (hasErrors) {
              outlineStyle = `1px solid ${colors.error}`;
            } else if (
              isFieldSelected(field.id) &&
              field.input_type !== 'page'
            ) {
              outlineStyle = `1px solid ${colors.teal300}`;
            }
            const fieldIdentifier = snakeCase(field.title_multiloc[locale]);

            return (
              <FormFieldsContainer
                role={'button'}
                key={field.id}
                style={{ outline: outlineStyle, outlineOffset: '-1px' }}
                data-cy={`e2e-field-${fieldIdentifier}`}
                background={getFieldBackgroundColor(field)}
                onClick={() => {
                  isEditingDisabled
                    ? undefined
                    : onEditField({ ...field, index });
                }}
              >
                <SortableRow
                  iconFill={getTitleColor(field)}
                  iconMargin="0px 0px 0px 24px"
                  id={field.id}
                  index={index}
                  moveRow={handleDragRow}
                  dropRow={() => {
                    // Do nothing, no need to handle dropping a row for now
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    className="expand"
                  >
                    <Box display="flex" alignItems="center">
                      <Text
                        as="span"
                        color={getIndexTitleColor(field)}
                        fontSize="base"
                        mt="auto"
                        mb="auto"
                        fontWeight="bold"
                        mx="12px"
                      >
                        {field.input_type === 'page' && (
                          <>
                            <FormattedMessage {...messages.page} />
                            {getIndexForTitle(formCustomFields, field)}
                          </>
                        )}
                        {field.input_type !== 'page' && (
                          <>
                            <FormattedMessage {...messages.question} />
                            {getIndexForTitle(formCustomFields, field)}
                          </>
                        )}
                      </Text>
                      <Text
                        as="span"
                        fontSize="base"
                        mt="auto"
                        mb="auto"
                        color={getTitleColor(field)}
                      >
                        <T value={field.title_multiloc} />
                      </Text>
                    </Box>
                    <Box pr="24px" display="flex">
                      {!isNilOrError(field.input_type) &&
                        field.input_type !== 'page' && (
                          <Box ml="12px">
                            {' '}
                            <Badge
                              className="inverse"
                              color={colors.coolGrey600}
                            >
                              <FormattedMessage
                                {...getTranslatedFieldType(field.input_type)}
                              />
                            </Badge>
                          </Box>
                        )}
                      {field.required && (
                        <Box ml="12px">
                          {' '}
                          <Badge className="inverse" color={colors.error}>
                            <FormattedMessage {...messages.required} />
                          </Badge>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </SortableRow>
              </FormFieldsContainer>
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
