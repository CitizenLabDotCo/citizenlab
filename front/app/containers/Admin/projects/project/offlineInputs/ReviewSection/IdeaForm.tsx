import React, { useState } from 'react';

// hooks
import useInputSchema from 'hooks/useInputSchema';
import useUpdateIdea from 'api/ideas/useUpdateIdea';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Fields from 'components/Form/Components/Fields';

// routing
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

// utils
import { customAjv } from 'components/Form';

// typings
import { Multiloc } from 'typings';
import { FormData } from 'components/Form/typings';

interface Props {
  projectId: string;
  ideaId: string;
  title_multiloc: Multiloc;
  body_multiloc: Multiloc;
}

const IdeaForm = ({
  projectId,
  ideaId,
  title_multiloc,
  body_multiloc,
}: Props) => {
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);
  const visibleData = formData || { title_multiloc, body_multiloc };

  const { mutateAsync: updateIdea } = useUpdateIdea();

  const { schema, uiSchema } = useInputSchema({
    projectId,
    // phaseId, // TODO
  });

  if (!schema || !uiSchema) return null;

  const onSubmit = async () => {
    const { title_multiloc, body_multiloc } = visibleData;

    await updateIdea({
      id: ideaId,
      requestBody: {
        publication_status: 'published',
        title_multiloc,
        body_multiloc,
      },
    });

    removeSearchParams(['idea_id']);
  };

  return (
    <Box w="90%">
      <Fields
        ajv={customAjv}
        showAllErrors={showAllErrors}
        setShowAllErrors={setShowAllErrors}
        schema={schema}
        uiSchema={filterUiSchema(uiSchema)}
        data={visibleData}
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
