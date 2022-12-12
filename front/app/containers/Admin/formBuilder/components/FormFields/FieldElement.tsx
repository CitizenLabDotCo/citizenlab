import React from 'react';
import { useFormContext } from 'react-hook-form';

// intl
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import messages from '../messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import {
  isFieldSelected,
  getFieldBackgroundColor,
  getTitleColor,
  getIndexForTitle,
  getIndexTitleColor,
} from './utils';

// components
import {
  Box,
  Badge,
  Text,
  colors,
  Icon,
} from '@citizenlab/cl2-component-library';
import T from 'components/T';

// styling
import styled from 'styled-components';

// hooks and services
import {
  IFlatCustomField,
  IFlatCustomFieldWithIndex,
} from 'services/formCustomFields';
import { FlexibleRow } from '../FlexibleRow';

const FormFieldsContainer = styled(Box)`
  &:hover {
    cursor: pointer;
  }
`;

type Props = {
  field: IFlatCustomField;
  isEditingDisabled: boolean;
  onEditField: (field: IFlatCustomFieldWithIndex) => void;
  getTranslatedFieldType: (fieldType: string) => MessageDescriptor;
  selectedFieldId?: string;
};

export const FieldElement = (props: Props) => {
  const {
    field,
    isEditingDisabled,
    onEditField,
    getTranslatedFieldType,
    selectedFieldId,
  } = props;
  const {
    watch,
    formState: { errors },
  } = useFormContext();
  const formCustomFields: IFlatCustomField[] = watch('customFields');
  const index = formCustomFields.findIndex((f) => f.id === field.id);

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
        isEditingDisabled ? undefined : onEditField({ ...field, index });
      }}
      data-cy="e2e-field-row"
    >
      <FlexibleRow rowHeight={field.input_type === 'page' ? '50px' : '70px'}>
        <Box
          display="flex"
          justifyContent="space-between"
          className="expand"
          width="100%"
          ml={field.input_type === 'page' ? '8px' : '32px'}
        >
          <Box display="flex" alignItems="center" height="100%">
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
          <Box pr="32px" display="flex" height="100%" alignContent="center">
            {!isNilOrError(field.input_type) && field.input_type !== 'page' && (
              <Box my="auto" ml="12px">
                {' '}
                <Badge className="inverse" color={colors.coolGrey600}>
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
      </FlexibleRow>
    </FormFieldsContainer>
  );
};
