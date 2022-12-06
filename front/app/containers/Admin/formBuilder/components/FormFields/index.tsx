import React from 'react';
import { DndProvider } from 'react-dnd-cjs';
import HTML5Backend from 'react-dnd-html5-backend-cjs';
import { useFormContext } from 'react-hook-form';
// styling
import styled from 'styled-components';
import {
  Box,
  Badge,
  Text,
  colors,
  Icon,
} from '@citizenlab/cl2-component-library';
// hooks and services
import useLocale from 'hooks/useLocale';
import {
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'services/formCustomFields';
import {
  isFieldSelected,
  getFieldBackgroundColor,
  getTitleColor,
  getIndexForTitle,
  getIndexTitleColor,
} from './utils';
// intl
import { FormattedMessage } from 'utils/cl-intl';
// utils
import { isNilOrError } from 'utils/helperUtils';
import T from 'components/T';
// components
import { List } from 'components/admin/ResourceList';
import { SortableRow } from '../SortableRow';
import messages from '../messages';

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
  dropRow?: (initialIndex: number, finalIndex: number) => void;
  isEditingDisabled: boolean;
  selectedFieldId?: string;
}

const FormFields = ({
  onEditField,
  dropRow,
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
              isFieldSelected(selectedFieldId, field.id) &&
              field.input_type !== 'page'
            ) {
              outlineStyle = `1px solid ${colors.teal300}`;
            }

            return (
              <FormFieldsContainer
                role={'button'}
                key={field.id}
                style={{ outline: outlineStyle, outlineOffset: '-1px' }}
                background={getFieldBackgroundColor(selectedFieldId, field)}
                onClick={() => {
                  isEditingDisabled
                    ? undefined
                    : onEditField({ ...field, index });
                }}
                data-cy="e2e-field-row"
              >
                <SortableRow
                  rowHeight={field.input_type === 'page' ? '50px' : '70px'}
                  id={field.id}
                  index={index}
                  dropRow={dropRow}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    className="expand"
                    width="100%"
                    ml={field.input_type === 'page' ? '8px' : '32px'}
                  >
                    <Box display="flex" alignItems="center">
                      <Box flexGrow={0} flexShrink={0}>
                        <Icon
                          ml="28px"
                          width="12px"
                          fill={getIndexTitleColor(selectedFieldId, field)}
                          name="sort"
                        />
                      </Box>

                      <Text
                        as="span"
                        color={getIndexTitleColor(selectedFieldId, field)}
                        fontSize="base"
                        mt="auto"
                        mb="auto"
                        fontWeight="bold"
                        mx="12px"
                      >
                        <>
                          <FormattedMessage
                            {...(field.input_type === 'page'
                              ? messages.page
                              : messages.question)}
                          />
                          {getIndexForTitle(formCustomFields, field)}
                        </>
                      </Text>
                      <Text
                        as="span"
                        fontSize="base"
                        mt="auto"
                        mb="auto"
                        color={getTitleColor(selectedFieldId, field)}
                      >
                        <T value={field.title_multiloc} />
                      </Text>
                    </Box>
                    <Box
                      pr="32px"
                      display="flex"
                      height="100%"
                      alignContent="center"
                    >
                      {!isNilOrError(field.input_type) &&
                        field.input_type !== 'page' && (
                          <Box my="auto" ml="12px">
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
                        <Box mt="auto" mb="auto" ml="12px">
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
