import React from 'react';

// intl
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// components
import { Button, colors, Title, Box } from '@citizenlab/cl2-component-library';

import useUpdateAnalysisTag from 'api/analysis_tags/useUpdateAnalysisTag';
import { object, string } from 'yup';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import Input from 'components/HookForm/Input';

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
