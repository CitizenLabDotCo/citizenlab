import React, { Suspense, useEffect } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { FormProvider, UseFormSetError } from 'react-hook-form';
import { useParams } from 'utils/router';

import useCustomFields from 'api/custom_fields/useCustomFields';
import usePhase from 'api/phases/usePhase';

import usePageForm from 'components/CustomFieldsForm/Page/usePageForm';
import Feedback from 'components/HookForm/Feedback';

const CustomFields = React.lazy(
  () => import('components/CustomFieldsForm/CustomFields')
);

type FormValues = Record<string, any>;
interface Props {
  formData: FormValues;
  setFormData: (formData: FormValues) => void;
  setIdeaFormDataValid: (isValid: boolean) => void;
  setError: React.MutableRefObject<UseFormSetError<FormValues> | undefined>;
}

const IdeaForm = ({
  formData,
  setFormData,
  setIdeaFormDataValid,
  setError,
}: Props) => {
  const { projectId, phaseId } = useParams({ strict: false }) as {
    projectId: string;
    phaseId: string;
  };

  const { data: phase } = usePhase(phaseId);
  const participationMethod = phase?.data.attributes.participation_method;

  const { data: customFields } = useCustomFields({
    projectId,
    phaseId: participationMethod === 'native_survey' ? phaseId : undefined,
    publicFields: true,
  });

  const questions = customFields?.filter(
    (field) =>
      field.input_type !== 'page' &&
      field.key !== 'topic_ids' &&
      field.key !== 'cosponsor_ids' &&
      field.key !== 'idea_images_attributes' &&
      field.key !== 'idea_files_attributes'
  );

  const { methods } = usePageForm({
    pageQuestions: questions || [],
    defaultValues: formData,
  });

  // Ensure initial form validation state is correct
  useEffect(() => {
    setIdeaFormDataValid(methods.formState.isValid);
  }, [setIdeaFormDataValid, methods.formState.isValid]);

  // Watch for changes in form values and update formData and form validation state accordingly
  useEffect(() => {
    const subscription = methods.watch((values) => {
      setFormData(values);
      methods.trigger();
    });
    return () => subscription.unsubscribe();
  }, [methods, formData, setFormData, setIdeaFormDataValid]);

  // We are setting the setError function to the ref so that it can be used easily in the parent component for error handling
  setError.current = methods.setError;

  return (
    <Box w="90%">
      <FormProvider {...methods}>
        <form>
          <Feedback />
          {questions && (
            <Suspense>
              <CustomFields
                questions={questions}
                projectId={projectId}
                phase={phase?.data}
                participationMethod={
                  phase?.data.attributes.participation_method
                }
              />
            </Suspense>
          )}
        </form>
      </FormProvider>
    </Box>
  );
};

export default IdeaForm;
