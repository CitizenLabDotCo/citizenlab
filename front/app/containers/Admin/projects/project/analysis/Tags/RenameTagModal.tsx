import React from 'react';

import { Button, colors, Title, Box } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { object, string } from 'yup';

import useUpdateAnalysisTag from 'api/analysis_tags/useUpdateAnalysisTag';

import Input from 'components/HookForm/Input';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

import messages from './messages';

type RenameTagProps = {
  closeRenameModal: () => void;
  originalTagName: string;
  id: string;
  analysisId: string;
};

interface FormValues {
  name: string;
}

const RenameTag = ({
  closeRenameModal,
  originalTagName,
  id,
  analysisId,
}: RenameTagProps) => {
  const { formatMessage } = useIntl();
  const { mutateAsync: updateTag, isLoading } = useUpdateAnalysisTag();

  const schema = object({
    name: string().required(formatMessage(messages.emptyNameError)),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues: {
      name: originalTagName,
    },
    resolver: yupResolver(schema),
  });

  const onFormSubmit = async ({ name }: FormValues) => {
    try {
      await updateTag({ analysisId, id, name });
      closeRenameModal();
    } catch (errors) {
      handleHookFormSubmissionError({ errors }, methods.setError);
    }
  };

  return (
    <Box>
      <Title>{formatMessage(messages.renameTagModalTitle)}</Title>
      <FormProvider {...methods}>
        <Box as="form" mt="40px" onSubmit={methods.handleSubmit(onFormSubmit)}>
          <Input
            type="text"
            name="name"
            label={formatMessage(messages.renameTagModalNameLabel)}
            fieldName="tag_name"
          />
          <Box display="flex" justifyContent="flex-end" mt="40px" gap="24px">
            <Button
              onClick={closeRenameModal}
              buttonStyle="secondary"
              type="button"
            >
              {formatMessage(messages.renameTagModalCancel)}
            </Button>
            <Button
              processing={isLoading}
              type="submit"
              bgColor={colors.primary}
            >
              {formatMessage(messages.renameTagModalSave)}
            </Button>
          </Box>
        </Box>
      </FormProvider>
    </Box>
  );
};

export default RenameTag;
