import React from 'react';

import { Button, Box } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty } from 'lodash-es';
import { FormProvider, useForm } from 'react-hook-form';
import { object, string } from 'yup';

import { IFile } from 'api/files/types';
import useUpdateFile from 'api/files/useUpdateFile';

import Feedback from 'components/HookForm/Feedback';
import Input from 'components/HookForm/Input';
import Select from 'components/HookForm/Select';
import TextAreaMultilocWithLocaleSwitcher from 'components/HookForm/TextAreaMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

import messages from '../messages';

type Props = {
  file: IFile;
};

const FileEditForm = ({ file }: Props) => {
  const { formatMessage } = useIntl();
  const { mutateAsync: updateFile } = useUpdateFile();

  // Extract the file name and extension from the file object, so we can use it when we save.
  const fileNameWithoutExtension = file.data.attributes.name.split('.')[0];
  const fileExtensionString = file.data.attributes.name
    .split('.')
    .slice(1)
    .join('.');

  // Setup for the file edit form
  const schema = object({
    name: string()
      .matches(/^[^.]*$/, formatMessage(messages.fileNameCannotContainDot))
      .required(formatMessage(messages.fileNameRequired)),
    category: string()
      .oneOf(['type_1', 'type_2', 'type_3', 'type_4']) // TODO: Replace with actual category types once implemented.
      .notRequired(),
    description_multiloc: object().notRequired(),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues: {
      name: fileNameWithoutExtension || '',
      category: 'type_1', // TODO: Replace with actual default value once category is implemented.
      description_multiloc: {
        en: 'This is a sample AI-generated description for this file. It contains a few sentences describing the contents of this file. It can also be edited manually by the user.',
      }, // TODO: Replace with actual default value once description is implemented.
    },
    resolver: yupResolver(schema),
  });

  const onFormSubmit = async () => {
    try {
      await updateFile({
        id: file.data.id,
        file: {
          // Join the file name back with the extension before persisting.
          name: `${methods.getValues('name')}.${fileExtensionString}`,
          // TODO: Add category and description_multiloc once implemented
        },
      });
    } catch (error) {
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onFormSubmit)}>
        <Box display="flex" flexDirection="column" gap="24px">
          <Input
            type="text"
            name="name"
            label={formatMessage(messages.fileNameLabel)}
            required
          />

          <Select
            name="category"
            label={formatMessage(messages.categoryLabel)}
            options={[
              // TODO: Replace with actual category types once implemented.
              { value: 'type_1', label: 'Type 1' },
              { value: 'type_2', label: 'Type 2' },
              { value: 'type_3', label: 'Type 3' },
              { value: 'type_4', label: 'Type 4' },
            ]}
          />

          <TextAreaMultilocWithLocaleSwitcher
            name="description_multiloc"
            label={formatMessage(messages.fileDescriptionLabel)}
          />
        </Box>

        {!isEmpty(methods.formState.dirtyFields) && (
          <Box>
            <Box display="flex" justifyContent="flex-end" mt="16px">
              <Button
                size="s"
                buttonStyle="admin-dark-outlined"
                type="submit"
                disabled={methods.formState.isSubmitting}
              >
                {formatMessage(messages.save)}
              </Button>
            </Box>

            <Feedback
              successMessage={formatMessage(
                messages.saveFileMetadataSuccessMessage
              )}
            />
          </Box>
        )}
      </form>
    </FormProvider>
  );
};

export default FileEditForm;
