import React from 'react';

import {
  Box,
  Title,
  Text,
  Checkbox,
  Button,
  IconTooltip,
} from '@citizenlab/cl2-component-library';
import { xor } from 'lodash-es';
import { FormattedDate } from 'react-intl';

import { IInputsData } from 'api/analysis_inputs/types';
import useIdeaCustomField from 'api/idea_custom_fields/useIdeaCustomField';
import useUserCustomFieldsOptions from 'api/user_custom_fields_options/useUserCustomFieldsOptions';

import T from 'components/T';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';
import messages from '../messages';
import tracks from '../tracks';

import LineMapPreview from './MapPreview/LineMapPreview';
import PointMapPreview from './MapPreview/PointMapPreview';
import PolygonMapPreview from './MapPreview/PolygonMapPreview';
import ShapefilePreview from './ShapefilePreview';

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
  return option ? (
    <T value={option.attributes.title_multiloc} />
  ) : (
    <>No answer</>
  );
};

const FilterToggleButton = ({ customFieldId, value }) => {
  const { formatMessage } = useIntl();
  const filters = useAnalysisFilterParams();
  const filterValue = filters[`input_custom_${customFieldId}`];
  const isFilterSet = filterValue?.includes(value);

  const handleToggleFilterOption = (customFieldId, customOptionKey) => () => {
    const newFilterValue = xor(filterValue, [customOptionKey]);
    updateSearchParams({
      [`input_custom_${customFieldId}`]: newFilterValue.length
        ? newFilterValue
        : undefined,
    });
    trackEventByName(tracks.inputCustomFieldFilterUsed, { customFieldId });
  };

  return (
    <Button
      onClick={handleToggleFilterOption(customFieldId, value)}
      buttonStyle="secondary-outlined"
      size="s"
      margin="0"
      padding="1px"
    >
      <IconTooltip
        icon={isFilterSet ? 'close' : 'filter-2'}
        content={
          <Box minWidth="150px">
            {isFilterSet
              ? formatMessage(messages.removeFilter)
              : formatMessage(messages.filter)}
          </Box>
        }
      />
    </Button>
  );
};

/**
 * Given a custom_field definition and an input, render a multiline
 * representation of the value of the custom field for that input
 */
const FieldValue = ({ projectId, phaseId, customFieldId, input }: Props) => {
  const { formatMessage } = useIntl();

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
          <Title variant="h3" my="0px">
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
            <Title variant="h5" m="0px">
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
          return (
            <Box>
              <Title variant="h5" m="0px">
                <T value={customField.data.attributes.title_multiloc} />
              </Title>
              <Text m="0">
                {input.attributes.custom_field_values[
                  customField.data.attributes.key
                ] || formatMessage(messages.noAnswer)}
              </Text>
            </Box>
          );
        case 'number':
        case 'linear_scale': {
          return (
            <Box>
              <Title variant="h5" m="0px">
                <T value={customField.data.attributes.title_multiloc} />
              </Title>
              <Box
                display="flex"
                justifyContent="flex-start"
                alignItems="flex-start"
              >
                <Text m="0">
                  {input.attributes.custom_field_values[
                    customField.data.attributes.key
                  ] || formatMessage(messages.noAnswer)}
                </Text>
                <Box ml="8px">
                  <FilterToggleButton
                    customFieldId={customField.data.id}
                    value={rawValue || null}
                  />
                </Box>
              </Box>
            </Box>
          );
        }
        case 'multiline_text': {
          return (
            <Box>
              <Title variant="h5" m="0px">
                <T value={customField.data.attributes.title_multiloc} />
              </Title>
              <Text whiteSpace="pre-line">
                {input.attributes.custom_field_values[
                  customField.data.attributes.key
                ] || formatMessage(messages.noAnswer)}
              </Text>
            </Box>
          );
        }
        case 'select': {
          return (
            <Box>
              <Title variant="h5" m="0px">
                <T value={customField.data.attributes.title_multiloc} />
              </Title>
              <Box
                display="flex"
                justifyContent="flex-start"
                alignItems="flex-start"
              >
                <Text m="0">
                  <SelectOptionText
                    customFieldId={customField.data.id}
                    selectedOptionKey={rawValue}
                  />
                </Text>
                <Box ml="8px">
                  <FilterToggleButton
                    customFieldId={customField.data.id}
                    value={rawValue || null}
                  />
                </Box>
              </Box>
            </Box>
          );
        }
        case 'multiselect': {
          return (
            <Box>
              <Title variant="h5" m="0px">
                <T value={customField.data.attributes.title_multiloc} />
              </Title>
              <Text>
                {(rawValue as string[] | undefined)?.map((optionKey) => (
                  <Box
                    key={optionKey}
                    display="flex"
                    justifyContent="flex-start"
                    alignItems="flex-start"
                  >
                    <SelectOptionText
                      customFieldId={customField.data.id}
                      selectedOptionKey={optionKey}
                    />
                    <Box ml="8px">
                      <FilterToggleButton
                        customFieldId={customField.data.id}
                        value={optionKey}
                      />
                    </Box>
                  </Box>
                ))}
              </Text>
            </Box>
          );
        }
        case 'checkbox': {
          return (
            <Box>
              <Title variant="h5" m="0px">
                <T value={customField.data.attributes.title_multiloc} />
              </Title>
              <Text>
                {rawValue === true || rawValue === false ? (
                  <Checkbox disabled checked={rawValue} onChange={() => {}} />
                ) : (
                  formatMessage(messages.noAnswer)
                )}
              </Text>
            </Box>
          );
        }
        case 'date': {
          return (
            <Box>
              <Title variant="h5" m="0px">
                <T value={customField.data.attributes.title_multiloc} />
              </Title>
              <Text>
                {rawValue ? (
                  <FormattedDate value={rawValue} />
                ) : (
                  formatMessage(messages.noAnswer)
                )}
              </Text>
            </Box>
          );
        }
        case 'shapefile_upload': {
          return (
            <Box>
              <Title variant="h5" m="0px">
                <T value={customField.data.attributes.title_multiloc} />
              </Title>
              <ShapefilePreview inputId={input.id} file={rawValue} />
            </Box>
          );
        }
        case 'point': {
          return (
            <Box>
              <Title variant="h5" m="0px" mb="4px">
                <T value={customField.data.attributes.title_multiloc} />
              </Title>
              <PointMapPreview rawValue={rawValue} />
            </Box>
          );
        }
        case 'line': {
          return (
            <Box>
              <Title variant="h5" m="0px" mb="4px">
                <T value={customField.data.attributes.title_multiloc} />
              </Title>
              <LineMapPreview rawValue={rawValue} />
            </Box>
          );
        }
        case 'polygon': {
          return (
            <Box>
              <Title variant="h5" m="0px" mb="4px">
                <T value={customField.data.attributes.title_multiloc} />
              </Title>
              <PolygonMapPreview rawValue={rawValue} />
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
