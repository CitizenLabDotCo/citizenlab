import React from 'react';

import { IInputsData } from 'api/analysis_inputs/types';
import useIdeaCustomField from 'api/idea_custom_fields/useIdeaCustomField';

import { getRelatedTextAnswer } from '../../../../util';

import BodyMultilocLongField from './CustomFieldLongFieldValues/BodyMultilocLongField';
import CheckboxLongField from './CustomFieldLongFieldValues/CheckboxLongField';
import DateLongField from './CustomFieldLongFieldValues/DateLongField';
import LinearScaleLongField from './CustomFieldLongFieldValues/LinearScaleLongField';
import LineLongField from './CustomFieldLongFieldValues/LineLongField';
import LocationDescriptionLongField from './CustomFieldLongFieldValues/LocationDescriptionLongField';
import MatrixLongField from './CustomFieldLongFieldValues/MatrixLongField';
import MultilineTextLongField from './CustomFieldLongFieldValues/MultilineTextLongField';
import MultiselectImageLongField from './CustomFieldLongFieldValues/MultiselectImageLongField';
import MultiselectLongField from './CustomFieldLongFieldValues/MultiselectLongField';
import PointfileLongField from './CustomFieldLongFieldValues/PointLongField';
import PolygonLongField from './CustomFieldLongFieldValues/PolygonLongField';
import RankingLongField from './CustomFieldLongFieldValues/RankingLongField';
import SelectLongField from './CustomFieldLongFieldValues/SelectLongField';
import ShpefileLongField from './CustomFieldLongFieldValues/ShapefileLongField';
import TextLongField from './CustomFieldLongFieldValues/TextLongField';
import TitleMultilocLongField from './CustomFieldLongFieldValues/TitleMultilocLongField';

type Props = {
  customFieldId: string;
  input: IInputsData;
  projectId?: string;
  phaseId?: string;
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

  const rawValue =
    input.attributes.custom_field_values[customField.data.attributes.key];

  // Get any related text answer for the custom field (E.g. "other" or "follow up" answer)
  const rawValueRelatedTextAnswer = getRelatedTextAnswer(
    input,
    customField.data.attributes.key
  );

  switch (customField.data.attributes.code) {
    case 'title_multiloc':
      return <TitleMultilocLongField input={input} customField={customField} />;
    case 'body_multiloc':
      return <BodyMultilocLongField input={input} customField={customField} />;
    case 'location_description':
      if (input.attributes.location_description) {
        return (
          <LocationDescriptionLongField
            input={input}
            customField={customField}
          />
        );
      } else {
        return null;
      }
    case null: {
      switch (customField.data.attributes.input_type) {
        case 'text':
          return <TextLongField input={input} customField={customField} />;
        case 'number':
        case 'rating':
        case 'sentiment_linear_scale':
        case 'linear_scale': {
          return (
            <LinearScaleLongField
              input={input}
              customField={customField}
              rawValue={rawValue}
              rawValueRelatedTextAnswer={rawValueRelatedTextAnswer}
            />
          );
        }
        case 'multiline_text': {
          return (
            <MultilineTextLongField
              input={input}
              customField={customField}
              rawValueRelatedTextAnswer={rawValueRelatedTextAnswer}
            />
          );
        }
        case 'select': {
          return (
            <SelectLongField
              customField={customField}
              rawValue={rawValue}
              rawValueRelatedTextAnswer={rawValueRelatedTextAnswer}
            />
          );
        }
        case 'multiselect': {
          return (
            <MultiselectLongField
              rawValue={rawValue}
              customField={customField}
            />
          );
        }
        case 'multiselect_image': {
          return (
            <MultiselectImageLongField
              rawValue={rawValue}
              customField={customField}
            />
          );
        }
        case 'checkbox': {
          return (
            <CheckboxLongField rawValue={rawValue} customField={customField} />
          );
        }
        case 'ranking': {
          return (
            <RankingLongField rawValue={rawValue} customField={customField} />
          );
        }
        case 'date': {
          return (
            <DateLongField rawValue={rawValue} customField={customField} />
          );
        }
        case 'shapefile_upload': {
          return (
            <ShpefileLongField
              input={input}
              rawValue={rawValue}
              customField={customField}
            />
          );
        }
        case 'point': {
          return (
            <PointfileLongField rawValue={rawValue} customField={customField} />
          );
        }
        case 'line': {
          return (
            <LineLongField rawValue={rawValue} customField={customField} />
          );
        }
        case 'polygon': {
          return (
            <PolygonLongField rawValue={rawValue} customField={customField} />
          );
        }
        case 'matrix_linear_scale': {
          return (
            <MatrixLongField rawValue={rawValue} customField={customField} />
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
