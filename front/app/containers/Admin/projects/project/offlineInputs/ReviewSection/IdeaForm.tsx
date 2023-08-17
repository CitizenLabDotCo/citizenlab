import React from 'react';

// hooks
import useInputSchema from 'hooks/useInputSchema';
import useUpdateIdea from 'api/ideas/useUpdateIdea';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Form from 'components/Form';

// routing
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

// typings
import { Multiloc } from 'typings';

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
  const initialFormData = { title_multiloc, body_multiloc }; // TODO
  const { mutateAsync: updateIdea } = useUpdateIdea();

  const { schema, uiSchema } = useInputSchema({
    projectId,
    // phaseId, // TODO
  });

  if (!schema || !uiSchema) return null;

  const onSubmit = async ({ title_multiloc, body_multiloc }) => {
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
      <Form
        schema={schema}
        uiSchema={filterUiSchema(uiSchema)}
        onSubmit={onSubmit}
        initialFormData={initialFormData}
        getAjvErrorMessage={(() => {}) as any}
        // getApiErrorMessage={getApiErrorMessage}
        inputId={undefined}
        config="input"
      />
    </Box>
  );
};

const filterUiSchema = (uiSchema) => {
  return {
    ...uiSchema,
    elements: uiSchema.elements
      .filter((element) => element.label !== 'Images and attachments')
      .map((element) => {
        if (element.label === 'Details') {
          return {
            ...element,
            elements: element.elements.filter((subElement) => {
              return subElement.label !== 'Tags';
            }),
          };
        } else {
          return element;
        }
      }),
  };
};

export default IdeaForm;
