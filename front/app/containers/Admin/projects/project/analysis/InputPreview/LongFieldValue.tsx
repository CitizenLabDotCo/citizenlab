import React from 'react';

import { IInputsData } from 'api/analysis_inputs/types';
import useIdeaCustomField from 'api/idea_custom_fields/useIdeaCustomField';

import { Box, Title, Text, Checkbox } from '@citizenlab/cl2-component-library';

import T from 'components/T';
import useUserCustomFieldsOptions from 'api/user_custom_fields_options/useUserCustomFieldsOptions';
import { FormattedDate } from 'react-intl';

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
 * Given a custom_field definition and an input, render a multiline
 * representation of the value of the custom field for that input
 */
const FieldValue = ({ projectId, phaseId, customFieldId, input }: Props) => {
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

  switch (customField.data.attributes.code) {
    case 'title_multiloc':
      return (
        <Box>
          <Title variant="h3">
            <T
              value={input.attributes[customField.data.attributes.key]}
              supportHtml={true}
            />
          </Title>
        </Box>
      );
    case 'body_multiloc':
      return (
        <Text>
          <T
            value={input.attributes[customField.data.attributes.key]}
            supportHtml={true}
          />
        </Text>
      );
    case 'location_description':
      if (input.attributes.location_description) {
        return (
          <Box>
            <Title variant="h5">
              <T value={customField.data.attributes.title_multiloc} />
            </Title>
            <Text>{input.attributes.location_description}</Text>
          </Box>
        );
      } else {
        return null;
      }
    case null: {
      const rawValue =
        input.attributes.custom_field_values[customField.data.attributes.key];
      switch (customField.data.attributes.input_type) {
        case 'text':
        case 'number':
        case 'linear_scale': {
          return (
            <Box>
              <Title variant="h5">
                <T value={customField.data.attributes.title_multiloc} />
              </Title>
              <Text>
                {input.attributes.custom_field_values[
                  customField.data.attributes.key
                ] || 'No answer'}
              </Text>
            </Box>
          );
        }
        case 'multiline_text': {
          return (
            <Box>
              <Title variant="h5">
                <T value={customField.data.attributes.title_multiloc} />
              </Title>
              <Text whiteSpace="pre-line">
                {input.attributes.custom_field_values[
                  customField.data.attributes.key
                ] || 'No answer'}
              </Text>
            </Box>
          );
        }
        case 'select': {
          return (
            <Box>
              <Title variant="h5">
                <T value={customField.data.attributes.title_multiloc} />
              </Title>
              <Text>
                <SelectOptionText
                  customFieldId={customField.data.id}
                  selectedOptionKey={rawValue}
                />
              </Text>
            </Box>
          );
        }
        case 'multiselect': {
          return (
            <Box>
              <Title variant="h5">
                <T value={customField.data.attributes.title_multiloc} />
              </Title>
              <Text>
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
              </Text>
            </Box>
          );
        }
        case 'checkbox': {
          return (
            <Box>
              <Title variant="h5">
                <T value={customField.data.attributes.title_multiloc} />
              </Title>
              <Text>
                {rawValue === true || rawValue === false ? (
                  <Checkbox disabled checked={rawValue} onChange={() => {}} />
                ) : (
                  'No answer'
                )}
              </Text>
            </Box>
          );
        }
        case 'date': {
          return (
            <Box>
              <Title variant="h5">
                <T value={customField.data.attributes.title_multiloc} />
              </Title>
              <Text>
                {rawValue ? <FormattedDate value={rawValue} /> : 'No answer'}
              </Text>
            </Box>
          );
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
    }
    default:
      return null;
  }
};

export default FieldValue;
