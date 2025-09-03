import React from 'react';

import { Button, Box, Text } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { isEmpty } from 'lodash-es';
import { FormProvider, useForm } from 'react-hook-form';
import { boolean, object, string } from 'yup';

import { FILE_CATEGORIES, IFile } from 'api/files/types';
import useUpdateFile from 'api/files/useUpdateFile';

import CheckboxWithLabel from 'components/HookForm/CheckboxWithLabel';
import Feedback from 'components/HookForm/Feedback';
import Input from 'components/HookForm/Input';
import Select from 'components/HookForm/Select';
import TextAreaMultilocWithLocaleSwitcher from 'components/HookForm/TextAreaMultilocWithLocaleSwitcher';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';

import messages from '../../messages';

import { getFileExtensionString, getFileNameWithoutExtension } from './utils';

type Props = {
  file: IFile;
  setEditingMetadata?: (editing: boolean) => void; // Optional prop to control editing state externally
};

const FileEditForm = ({ file, setEditingMetadata }: Props) => {
  const { formatMessage } = useIntl();
  const { mutateAsync: updateFile } = useUpdateFile();
  const fileName = file.data.attributes.name;

  // Extract the file name and extension from the file object, so we can use it when we save.
  const fileNameWithoutExtension = getFileNameWithoutExtension(fileName);
  const fileExtensionString = getFileExtensionString(fileName);

  // Setup for the file edit form
  const schema = object({
    name: string()
      .matches(/^[^.]*$/, formatMessage(messages.fileNameCannotContainDot))
      .required(formatMessage(messages.fileNameRequired)),
    category: string().oneOf(FILE_CATEGORIES).required(),
    description_multiloc: object().notRequired(),
    ai_processing_allowed: boolean().notRequired(),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues: {
      name: fileNameWithoutExtension || '',
      category: file.data.attributes.category,
      description_multiloc: file.data.attributes.description_multiloc,
      ai_processing_allowed:
        file.data.attributes.ai_processing_allowed || false,
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
          category: methods.getValues('category'),
          description_multiloc: methods.getValues('description_multiloc'),
          ai_processing_allowed: methods.getValues('ai_processing_allowed'),
        },
      });

      // Reset the form values after successful submission
      const values = methods.getValues();
      methods.reset(values);
      setEditingMetadata?.(false);
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
            options={FILE_CATEGORIES.map((category) => ({
              value: category,
              label: formatMessage(messages[category]),
            }))}
          />

          <TextAreaMultilocWithLocaleSwitcher
            name="description_multiloc"
            label={formatMessage(messages.fileDescriptionLabel)}
          />

          <CheckboxWithLabel
            name="ai_processing_allowed"
            label={
              <Text color="coolGrey600">
                {formatMessage(messages.allowAiProcessingSingleFile)}
              </Text>
            }
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

            <Feedback marginTop="16px" onlyShowErrors={true} />
          </Box>
        )}
      </form>
    </FormProvider>
  );
};

export default FileEditForm;
