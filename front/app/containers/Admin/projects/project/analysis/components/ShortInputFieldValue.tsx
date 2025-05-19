import React, { useMemo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { isNil } from 'lodash-es';
import { FormattedDate } from 'react-intl';

import useUserCustomFieldsOptions from 'api/custom_field_options/useCustomFieldOptions';
import { IIdeaCustomField } from 'api/idea_custom_fields/types';

import T from 'components/T';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

type Props = {
  customField: IIdeaCustomField;
  rawValue?: any;
  rawValueRelatedTextAnswer?: string;
};

const SelectOptionText = ({
  customFieldId,
  selectedOptionKey,
}: {
  customFieldId: string;
  selectedOptionKey: string;
}) => {
  const { data: options } = useUserCustomFieldsOptions(customFieldId);
  const option = useMemo(
    () =>
      options?.data.find(
        (option) => option.attributes.key === selectedOptionKey
      ),
    [options, selectedOptionKey]
  );
  return option ? <T value={option.attributes.title_multiloc} /> : null;
};

/**
 * Given a custom_field definition and the raw value from the
 * custom_field_values, render a one-line textual representation of the value of
 * the custom field for that input. Only renders anything for non-built-in
 * custom fields
 */
const ShortInputFieldValue = ({
  customField,
  rawValue,
  rawValueRelatedTextAnswer,
}: Props) => {
  const { formatMessage } = useIntl();
  // We only render non-built-in custom fields, assuming the parent has
  // dedicated logic to render the built-in fields
  if (customField.data.attributes.code) return null;

  if (isNil(rawValue)) {
    return <>{formatMessage(messages.noAnswer)}</>;
  }

  switch (customField.data.attributes.input_type) {
    case 'text':
    case 'multiline_text':
    case 'number':
    case 'checkbox':
    case 'rating':
    case 'sentiment_linear_scale':
    case 'linear_scale': {
      if (rawValue === null || rawValue === undefined || rawValue === '') {
        return <>No Answer</>;
      } else {
        return (
          <Box display="flex" flexDirection="column">
            <Box>{rawValue}</Box>
            <Box>{rawValueRelatedTextAnswer}</Box>
          </Box>
        );
      }
    }
    case 'select': {
      return (
        <Box>
          <SelectOptionText
            customFieldId={customField.data.id}
            selectedOptionKey={rawValue}
          />
          <Box>{rawValueRelatedTextAnswer}</Box>
        </Box>
      );
    }
    case 'multiselect': {
      return (
        <>
          {(rawValue as string[]).map((optionKey, index) => (
            <>
              {index !== 0 && ', '}
              <SelectOptionText
                key={`${optionKey}-${index}`}
                customFieldId={customField.data.id}
                selectedOptionKey={optionKey}
              />
            </>
          ))}
          <Box>{rawValueRelatedTextAnswer}</Box>
        </>
      );
    }
    case 'multiselect_image': {
      return (
        <>
          {(rawValue as string[]).map((optionKey, index) => (
            <>
              {index !== 0 && ', '}
              <SelectOptionText
                key={`${optionKey}-${index}`}
                customFieldId={customField.data.id}
                selectedOptionKey={optionKey}
              />
            </>
          ))}
        </>
      );
    }
    case 'date': {
      return <FormattedDate value={rawValue} />;
    }
    case 'file_upload': {
      // We don't support file upload fields in an analysis at the moment
      return null;
    }
    case 'shapefile_upload': {
      // We don't support shapefile upload fields in an analysis at the moment
      return null;
    }
    case 'point': {
      return null;
    }
    case 'line': {
      return null;
    }
    case 'polygon': {
      return null;
    }
    case 'ranking': {
      return null;
    }
    case 'matrix_linear_scale': {
      return null;
    }
    default: {
      // Makes TS throw a compile error in case we're not covering for an input_type
      const exhaustiveCheck: never = customField.data.attributes.input_type;
      return exhaustiveCheck;
    }
  }
};

export default ShortInputFieldValue;
