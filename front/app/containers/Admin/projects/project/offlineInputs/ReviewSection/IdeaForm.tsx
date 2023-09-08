import React, { useCallback } from 'react';

// hooks
import useInputSchema from 'hooks/useInputSchema';

// i18n
import ideaFormMessages from 'containers/IdeasNewPage/messages';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Fields from 'components/Form/Components/Fields';

// utils
import { customAjv } from 'components/Form';
import { getFieldNameFromPath } from 'utils/JSONFormUtils';

// typings
import {
  FormData,
  ApiErrorGetter,
  AjvErrorGetter,
} from 'components/Form/typings';
import { CLErrors } from 'typings';

interface Props {
  projectId: string;
  phaseId?: string;
  showAllErrors: boolean;
  apiErrors?: CLErrors;
  formData: FormData;
  setFormData: (formData: FormData) => void;
}

const IdeaForm = ({
  projectId,
  phaseId,
  showAllErrors,
  apiErrors,
  formData,
  setFormData,
}: Props) => {
  const { schema, uiSchema } = useInputSchema({
    projectId,
    phaseId,
  });

  const getApiErrorMessage: ApiErrorGetter = useCallback(
    (error) => {
      return (
        ideaFormMessages[
          `api_error_${uiSchema?.options?.inputTerm}_${error}`
        ] ||
        ideaFormMessages[`api_error_${error}`] ||
        ideaFormMessages[`api_error_invalid`]
      );
    },
    [uiSchema]
  );

  const getAjvErrorMessage: AjvErrorGetter = useCallback(
    (error) => {
      return (
        ideaFormMessages[
          `ajv_error_${uiSchema?.options?.inputTerm}_${
            getFieldNameFromPath(error.instancePath) ||
            error?.params?.missingProperty
          }_${error.keyword}`
        ] ||
        ideaFormMessages[
          `ajv_error_${
            getFieldNameFromPath(error.instancePath) ||
            error?.params?.missingProperty
          }_${error.keyword}`
        ] ||
        undefined
      );
    },
    [uiSchema]
  );

  if (!schema || !uiSchema) return null;

  return (
    <Box w="90%">
      <Fields
        ajv={customAjv}
        showAllErrors={showAllErrors}
        apiErrors={apiErrors}
        schema={schema}
        uiSchema={filterUiSchema(uiSchema)}
        data={formData}
        onChange={setFormData}
        config="input"
        getApiErrorMessage={getApiErrorMessage}
        getAjvErrorMessage={getAjvErrorMessage}
      />
    </Box>
  );
};

const NOT_SUPPORTED_SCOPES = new Set([
  '#/properties/author_id',
  '#/properties/idea_images_attributes',
  '#/properties/idea_files_attributes',
  '#/properties/topic_ids',
]);

const filterUiSchema = (uiSchema) => {
  return {
    options: uiSchema.options,
    type: 'VerticalLayout',
    elements: uiSchema.elements
      .flatMap((category) => category.elements)
      .filter((element) => !NOT_SUPPORTED_SCOPES.has(element.scope)),
  };
};

export default IdeaForm;
