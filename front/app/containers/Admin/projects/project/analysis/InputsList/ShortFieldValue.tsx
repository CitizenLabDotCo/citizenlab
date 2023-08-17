import React from 'react';

import { IInputsData } from 'api/analysis_inputs/types';
import useIdeaCustomField from 'api/idea_custom_fields/useIdeaCustomField';

import { Checkbox } from '@citizenlab/cl2-component-library';

import T from 'components/T';
import useUserCustomFieldsOptions from 'api/user_custom_fields_options/useUserCustomFieldsOptions';
import { FormattedDate } from 'react-intl';
import { isNil } from 'lodash-es';

type Props = {
  customFieldId: string;
  input: IInputsData;
  projectId?: string;
  phaseId?: string;
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
 * Given a custom_field definition and an input, render a one-line textual
 * representation of the value of the custom field for that input. Only renders
 * anything for non-built-in custom fields
 */
const ShortFieldValue = ({
  projectId,
  phaseId,
  customFieldId,
  input,
}: Props) => {
  const containerId: { projectId?: string; phaseId?: string } = {};
  if (projectId) {
    containerId.projectId = projectId;
  } else {
    containerId.phaseId = phaseId;
  }
  const { data: customField } = useIdeaCustomField({
    customFieldId,
    ...containerId,
  });

  if (!customField) return null;
  // We only render non-built-in custom fields, assuming the parent has
  // dedicated logic to render the built-in fields
  if (customField.data.attributes.code) return null;

  const rawValue =
    input.attributes.custom_field_values[customField.data.attributes.key];

  if (isNil(rawValue)) {
    return <>No answer</>;
  }

  switch (customField.data.attributes.input_type) {
    case 'text':
    case 'multiline_text':
    case 'number':
    case 'linear_scale': {
      return <>{rawValue}</>;
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
    case 'checkbox': {
      return <Checkbox disabled checked={rawValue} onChange={() => {}} />;
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

export default ShortFieldValue;
