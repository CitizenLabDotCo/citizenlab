import React from 'react';

import { JsonFormsCore, Layout } from '@jsonforms/core';
import { JsonForms } from '@jsonforms/react';
import { isEmpty } from 'lodash-es';

import { JsonFormsSchema } from 'api/idea_json_form_schema/types';

import useLocale from 'hooks/useLocale';

import { ErrorToReadProvider } from 'components/Form/Components/Fields/ErrorToReadContext';
import { selectRenderers } from 'components/Form/Components/Fields/formConfig';
import { APIErrorsContext, FormContext } from 'components/Form/contexts';

import { trackEventByName } from 'utils/analytics';
import clHistory from 'utils/cl-router/history';

import messages from '../messages';
import tracks from '../tracks';
import {
  findFirstSentimentLinearScale,
  schemaWithRequiredFirstQuestion,
} from '../utils';

type QuestionPreviewProps = {
  projectSlug?: string;
  phaseId?: string;
  schema: JsonFormsSchema | null;
  uiSchema: Layout | null;
  onClose: () => void;
};

const QuestionPreview = ({
  projectSlug,
  phaseId,
  schema,
  uiSchema,
  onClose,
}: QuestionPreviewProps) => {
  const locale = useLocale();

  // Extract the first sentiment question from the UI Schema
  const uiSchemaFirstQuestion = findFirstSentimentLinearScale(uiSchema);

  const redirectToFullSurvey = (
    data: Pick<JsonFormsCore, 'data' | 'errors'>
  ) => {
    if (!isEmpty(data.data)) {
      // Close the modal
      onClose();

      // Track the popup interaction
      trackEventByName(tracks.communityMonitorPopupAnsweredAndRedirected);

      // Redirect to full survey page
      clHistory.push(
        `/projects/${projectSlug}/surveys/new?phase_id=${phaseId}`
      );
    }
  };

  if (!schema || !uiSchemaFirstQuestion) {
    return null;
  }

  return (
    <APIErrorsContext.Provider value={{}}>
      <FormContext.Provider
        value={{
          getApiErrorMessage: () => {
            return messages.formError;
          },
          setFormData: redirectToFullSurvey,
          locale,
        }}
      >
        <ErrorToReadProvider>
          <JsonForms
            renderers={selectRenderers('survey')}
            uischema={uiSchemaFirstQuestion}
            schema={schemaWithRequiredFirstQuestion(schema)}
            onChange={redirectToFullSurvey}
            data={{}}
          />
        </ErrorToReadProvider>
      </FormContext.Provider>
    </APIErrorsContext.Provider>
  );
};

export default QuestionPreview;
