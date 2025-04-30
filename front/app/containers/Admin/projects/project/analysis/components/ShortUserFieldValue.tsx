import React from 'react';

import { isNil } from 'lodash-es';
import { FormattedDate } from 'react-intl';

import useUserCustomFieldsOptions from 'api/custom_field_options/useCustomFieldOptions';
import { IUserCustomField } from 'api/user_custom_fields/types';

import T from 'components/T';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

type Props = {
  customField: IUserCustomField;
  rawValue?: string | string[] | null[] | number | boolean;
};

const SelectOptionText = ({
  customFieldId,
  selectedOptionKey,
}: {
  customFieldId: string;
  selectedOptionKey: string;
}) => {
  const { data: options } = useUserCustomFieldsOptions(customFieldId);
  const option = options?.data.find(
    (option) => option.attributes.key === selectedOptionKey
  );
  return option ? <T value={option.attributes.title_multiloc} /> : null;
};

/**
 * Given a user custom_field definition and the raw value from the
 * custom_field_values, render a one-line textual representation of the value of
 * the custom field for that input.
 */
const ShortUserFieldValue = ({ customField, rawValue }: Props) => {
  const { formatMessage } = useIntl();
  if (isNil(rawValue)) {
    return <>{formatMessage(messages.noAnswer)}</>;
  }

  switch (customField.data.attributes.input_type) {
    case 'text':
    case 'multiline_text':
    case 'number':
    case 'checkbox':
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (rawValue === null || rawValue === undefined || rawValue === '') {
        return <>{formatMessage(messages.noAnswer)}</>;
      } else {
        return <>{rawValue}</>;
      }
    case 'select': {
      return (
        <SelectOptionText
          customFieldId={customField.data.id}
          selectedOptionKey={rawValue as string}
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
      return <FormattedDate value={rawValue as string} />;
    }
    default: {
      // Makes TS throw a compile error in case we're not covering for an input_type
      const exhaustiveCheck: never = customField.data.attributes.input_type;
      return exhaustiveCheck;
    }
  }
};

export default ShortUserFieldValue;
