import React from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import { FormProvider, useForm } from 'react-hook-form';
import { Multiloc } from 'typings';

import usePhases from 'api/phases/usePhases';
import useUpdatePhase from 'api/phases/useUpdatePhase';

import { usePhasePreviewPublisher } from 'components/admin/PhasePreview/DraftContext';
import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { isEmptyMultiloc } from 'utils/helperUtils';
import { useParams } from 'utils/router';

import messages from '../messages';

interface FormValues {
  description_multiloc: Multiloc;
}

interface Props {
  phaseId: string;
  descriptionMultiloc: Multiloc;
}

const SimplePhaseDescription = ({ phaseId, descriptionMultiloc }: Props) => {
  const { formatMessage } = useIntl();
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const { data: phases } = usePhases(projectId);
  const { mutateAsync: updatePhase } = useUpdatePhase();

  const methods = useForm<FormValues>({
    defaultValues: {
      description_multiloc: descriptionMultiloc,
    },
  });

  const publishPreview = usePhasePreviewPublisher('description', phaseId);
  React.useEffect(() => {
    const subscription = methods.watch(() =>
      publishPreview({
        description_multiloc: methods.getValues('description_multiloc'),
        draft_description_multiloc: {},
      })
    );
    return () => subscription.unsubscribe();
  }, [methods, publishPreview]);

  const onFormSubmit = async (formValues: FormValues) => {
    try {
      await updatePhase({
        phaseId,
        ...formValues,
      });
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onFormSubmit)}>
        <Box>
          <Text fontWeight="bold" m="0px" mb="12px">
            {formatMessage(messages.descriptionLabel)}
          </Text>
          {phases &&
            phases.data.length < 2 &&
            isEmptyMultiloc(descriptionMultiloc) && (
              <Box my="16px">
                <Warning>
                  {formatMessage(messages.emptyDescriptionWarning)}
                </Warning>
              </Box>
            )}
          <QuillMultilocWithLocaleSwitcher
            name="description_multiloc"
            withCTAButton
          />
          <Box display="flex" justifyContent="flex-end" mt="8px">
            <Button
              type="submit"
              buttonStyle="admin-dark"
              processing={methods.formState.isSubmitting}
            >
              {formatMessage(messages.descriptionSave)}
            </Button>
          </Box>
        </Box>
      </form>
    </FormProvider>
  );
};

export default SimplePhaseDescription;
