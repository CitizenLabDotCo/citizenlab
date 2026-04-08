import React from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import { FormProvider, useForm } from 'react-hook-form';
import { Multiloc } from 'typings';

import useUpdatePhase from 'api/phases/useUpdatePhase';

import QuillMultilocWithLocaleSwitcher from 'components/HookForm/QuillMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

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
  const { mutateAsync: updatePhase } = useUpdatePhase();

  const methods = useForm<FormValues>({
    defaultValues: {
      description_multiloc: descriptionMultiloc,
    },
  });

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
            {formatMessage(messages.descriptionTitle)}
          </Text>
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
              {formatMessage(messages.draftDescriptionPublish)}
            </Button>
          </Box>
        </Box>
      </form>
    </FormProvider>
  );
};

export default SimplePhaseDescription;
