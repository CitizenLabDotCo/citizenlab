import React from 'react';

import { Layout } from '@jsonforms/core';
import { JsonForms } from '@jsonforms/react';
import { isEmpty } from 'lodash-es';

import { JsonFormsSchema } from 'api/idea_json_form_schema/types';

import useLocale from 'hooks/useLocale';

import { ErrorToReadProvider } from 'components/Form/Components/Fields/ErrorToReadContext';
import { selectRenderers } from 'components/Form/Components/Fields/formConfig';
import { APIErrorsContext, FormContext } from 'components/Form/contexts';

import clHistory from 'utils/cl-router/history';

import messages from '../messages';

type QuestionPreviewProps = {
  projectSlug?: string;
  schema: JsonFormsSchema | null;
  uiSchema: Layout | null;
  onClose: () => void;
};

const QuestionPreview = ({
  projectSlug,
  schema,
  uiSchema,
  onClose,
}: QuestionPreviewProps) => {
  const locale = useLocale();

  const makeQuestionRequiredInSchema = (schema) => {
    return {
      ...schema,
      required: [
        'do_would_you_rate_the_level_of_safety_in_your_neighborhood_q6k',
      ],
    };
  };

  // Extract the first question from the UI Schema
  const uiSchemaFirstQuestion = uiSchema?.elements[1]['elements'][0];

  const redirectToFullSurvey = (data) => {
    if (!isEmpty(data?.data)) {
      // Close the modal
      onClose();
      // Redirect to full survey
      clHistory.push(`/projects/${projectSlug}/surveys/new`);
    }
  };

  if (!schema || !uiSchemaFirstQuestion) {
    return null;
  }

  const data = {};

  return (
    <APIErrorsContext.Provider value={{}}>
      <FormContext.Provider
        value={{
          getApiErrorMessage: () => {
            return messages.surveyDescription;
          },
          setFormData: redirectToFullSurvey,
          locale,
        }}
      >
        <ErrorToReadProvider>
          <JsonForms
            renderers={selectRenderers('survey')}
            uischema={uiSchemaFirstQuestion}
            schema={makeQuestionRequiredInSchema(schema)}
            onChange={redirectToFullSurvey}
            data={data}
          />
        </ErrorToReadProvider>
      </FormContext.Provider>
    </APIErrorsContext.Provider>
  );
};

export default QuestionPreview;
