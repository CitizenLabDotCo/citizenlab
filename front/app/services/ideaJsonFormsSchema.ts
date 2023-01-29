import { Layout } from '@jsonforms/core';
import { API_PATH } from 'containers/App/constants';
import { Locale } from 'typings';
import streams, { IStreamParams } from 'utils/streams';
import { CustomFieldCodes } from './ideaCustomFieldsSchemas';

export interface JSONSFormsSchemaObject {
  title: string;
  description: string;
  type: 'string' | 'array';
  uniqueItems?: boolean;
  minItems?: number;
  items?: {
    type: 'string' | 'array';
    format?: 'data-url' | 'string';
  };
}

export interface JsonFormsSchema {
  type: 'object';
  additionalProperties: boolean;
  properties: {
    [key in CustomFieldCodes]: JSONSFormsSchemaObject;
  };
  required: string[];
}

export interface IIdeaJsonFormSchemas {
  json_schema_multiloc: {
    [key in Locale]?: JsonFormsSchema;
  };
  ui_schema_multiloc: { [key in Locale]?: Layout };
}

const getInputFormsSchemaEndpoint = (
  projectId: string,
  phaseId?: string | null,
  inputId?: string | null
) => {
  // If we have the input id, we access the schema directly through the ideas endpoint
  if (inputId) {
    return `${API_PATH}/ideas/${inputId}/json_forms_schema`;
  } else if (phaseId) {
    return `${API_PATH}/phases/${phaseId}/custom_fields/json_forms_schema`;
  }
  return `${API_PATH}/projects/${projectId}/custom_fields/json_forms_schema`;
};

export function ideaJsonFormsSchemaStream(
  projectId: string,
  phaseId?: string | null,
  inputId?: string | null,
  streamParams: IStreamParams | null = null
) {
  const apiEndpoint = getInputFormsSchemaEndpoint(projectId, phaseId, inputId);
  return streams.get<IIdeaJsonFormSchemas | Error>({
    apiEndpoint,
    ...streamParams,
  });
}
