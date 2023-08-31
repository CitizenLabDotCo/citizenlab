import React, { useMemo } from 'react';

import T from 'components/T';
import useUserCustomFieldsOptions from 'api/user_custom_fields_options/useUserCustomFieldsOptions';
import { FormattedDate } from 'react-intl';
import { isNil } from 'lodash-es';
import { IIdeaCustomField } from 'api/idea_custom_fields/types';
import { useIntl } from 'utils/cl-intl';
import translations from '../translations';

type Props = {
  customField: IIdeaCustomField;
  rawValue?: any;
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
const ShortInputFieldValue = ({ customField, rawValue }: Props) => {
  const { formatMessage } = useIntl();
  // We only render non-built-in custom fields, assuming the parent has
  // dedicated logic to render the built-in fields
  if (customField.data.attributes.code) return null;

  if (isNil(rawValue)) {
    return <>{formatMessage(translations.noAnswer)}</>;
  }

  switch (customField.data.attributes.input_type) {
    case 'text':
    case 'multiline_text':
    case 'number':
    case 'checkbox':
    case 'linear_scale': {
      if (
        rawValue === null ||
        typeof rawValue === undefined ||
        rawValue === ''
      ) {
        return <>No Answer</>;
      } else {
        return <>{rawValue}</>;
      }
    }
    case 'select': {
      return (
        <SelectOptionText
          customFieldId={customField.data.id}
          selectedOptionKey={rawValue}
        />
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
    default: {
      // Makes TS throw a compile error in case we're not covering for an input_type
      const exhaustiveCheck: never = customField.data.attributes.input_type;
      return exhaustiveCheck;
    }
  }
};

export default ShortInputFieldValue;
