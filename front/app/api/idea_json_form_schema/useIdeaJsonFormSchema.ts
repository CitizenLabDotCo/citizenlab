import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import ideasJsonFormSchemaKeys from './keys';
import {
  IdeaJsonFormSchemaKeys,
  IParameters,
  IIdeaJsonFormSchemas,
} from './types';

const getInputFormsSchemaEndpoint = ({
  projectId,
  phaseId,
  inputId,
}: IParameters) => {
  // If we have the input id, we access the schema directly through the ideas endpoint
  if (inputId) {
    return `ideas/${inputId}/json_forms_schema`;
  } else if (phaseId) {
    return `phases/${phaseId}/custom_fields/json_forms_schema`;
  }
  return `projects/${projectId}/custom_fields/json_forms_schema`;
};

const fetchIdeaJsonSchema = (parameters: IParameters) =>
  fetcher<IIdeaJsonFormSchemas>({
    path: `/${getInputFormsSchemaEndpoint(parameters)}`,
    action: 'get',
  });

const useIdeaJsonSchema = (parameters: IParameters) => {
  return useQuery<
    IIdeaJsonFormSchemas,
    CLErrors,
    IIdeaJsonFormSchemas,
    IdeaJsonFormSchemaKeys
  >({
    queryKey: ideasJsonFormSchemaKeys.item(parameters),
    queryFn: () => fetchIdeaJsonSchema(parameters),
    enabled:
      !!parameters.projectId || !!parameters.inputId || !!parameters.phaseId,
  });
};

export default useIdeaJsonSchema;
