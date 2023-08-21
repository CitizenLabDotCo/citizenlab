import React, { useState } from 'react';

// hooks
import useInputSchema from 'hooks/useInputSchema';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Fields from 'components/Form/Components/Fields';

// utils
import { customAjv } from 'components/Form';

// typings
import { FormData } from 'components/Form/typings';

interface Props {
  projectId: string;
  formData: FormData;
  setFormData: (formData: FormData) => void;
}

const IdeaForm = ({ projectId, formData, setFormData }: Props) => {
  const [showAllErrors, setShowAllErrors] = useState(false);

  const { schema, uiSchema } = useInputSchema({
    projectId,
    // phaseId, // TODO
  });

  if (!schema || !uiSchema) return null;

  return (
    <Box w="90%">
      <Fields
        ajv={customAjv}
        showAllErrors={showAllErrors}
        setShowAllErrors={setShowAllErrors}
        schema={schema}
        uiSchema={filterUiSchema(uiSchema)}
        data={formData}
        onChange={setFormData}
        config="input"
      />
    </Box>
  );
};

const NOT_SUPPORTED_SCOPES = new Set([
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
