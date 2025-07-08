import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { FormProvider } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import useCustomFields from 'api/custom_fields/useCustomFields';
import usePhase from 'api/phases/usePhase';

import CustomFields from 'components/CustomFieldsForm/CustomFields';
import usePageForm from 'components/CustomFieldsForm/Page/usePageForm';
import { FormValues } from 'components/Form/typings';

interface Props {
  formData: FormValues;
  setFormData: (formData: FormValues) => void;
}

const IdeaForm = ({ formData, setFormData }: Props) => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };

  const { data: phase } = usePhase(phaseId);
  const participationMethod = phase?.data.attributes.participation_method;

  const { data: customFields } = useCustomFields({
    projectId,
    phaseId: participationMethod === 'native_survey' ? phaseId : undefined,
  });

  const questions = customFields?.filter(
    (field) =>
      field.input_type !== 'page' &&
      field.key !== 'topic_ids' &&
      field.key !== 'cosponsor_ids' &&
      field.key !== 'idea_images_attributes' &&
      field.key !== 'idea_files_attributes'
  );

  const { methods, setShowFormFeedback, showFormFeedback } = usePageForm({
    pageQuestions: questions || [],
    defaultValues: formData,
  });

  methods.watch((values) => {
    const updatedFormData = {
      ...formData,
      ...values,
    };
    setFormData(updatedFormData);
    setShowFormFeedback(true);
  });

  return (
    <Box w="90%">
      <FormProvider {...methods}>
        <form>
          {questions && (
            <CustomFields
              questions={questions}
              projectId={projectId}
              phase={phase?.data}
              participationMethod={phase?.data.attributes.participation_method}
            />
          )}
        </form>
      </FormProvider>
    </Box>
  );
};

export default IdeaForm;
