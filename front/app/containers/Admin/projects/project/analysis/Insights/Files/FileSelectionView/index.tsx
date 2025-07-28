import React, { useState, useEffect } from 'react';

import { Box, Button, Text, Title } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { array, object, string } from 'yup';

import useFiles from 'api/files/useFiles';

import FilesUpload from 'containers/Admin/projects/project/files/components/FilesUpload';
import { FileWithMeta } from 'containers/Admin/projects/project/files/components/FilesUpload/types';

import MultipleSelect from 'components/HookForm/MultipleSelect';
import GoBackButton from 'components/UI/GoBackButton';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
type Props = {
  setIsFileSelectionOpen: (isOpen: boolean) => void;
};

const FileSelectionView = ({ setIsFileSelectionOpen }: Props) => {
  const [filesUploadedFromSensemaking, setFilesUploadedFromSensemaking] =
    useState<FileWithMeta[]>([]);

  const projectId = useParams<{ projectId: string }>().projectId;
  const { data: files } = useFiles({
    project: [projectId || ''],
    enabled: !!projectId,
  });

  const { formatMessage } = useIntl();

  // React Hook Form setup
  const schema = object({
    file_ids: array().of(string()).notRequired(),
  });

  const methods = useForm({
    mode: 'onBlur',
    defaultValues: {
      file_ids: [],
    },
    resolver: yupResolver(schema),
  });

  const onFormSubmit = async () => {
    // TODO: Implement the logic to handle form submission
  };

  const fileOptions =
    files?.data.map((file) => ({
      value: file.id,
      label: file.attributes.name,
    })) || [];

  useEffect(() => {
    // Add any new filesUploadedFromSensemaking to the existing selected files
    if (filesUploadedFromSensemaking.length > 0) {
      const newFileIds = filesUploadedFromSensemaking.map((file) => file.id);
      const currentValues = methods.getValues('file_ids');
      const updatedValues = [...currentValues, ...newFileIds];

      // Update the form state with the new file IDs
      methods.setValue('file_ids', updatedValues);
    }
  }, [filesUploadedFromSensemaking, methods]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onFormSubmit)} />
      <Box display="flex" flexDirection="column" height="100%" maxWidth="500px">
        <Box mt="12px" display="flex" justifyContent="flex-start">
          <GoBackButton
            showGoBackText={false}
            onClick={() => setIsFileSelectionOpen(false)}
          />
          <Title fontWeight="semi-bold" m="0px" variant="h4" mt="2px" ml="16px">
            {formatMessage(messages.attachFiles)}
          </Title>
        </Box>
        <Text>{formatMessage(messages.attachFilesDescription)}</Text>

        <MultipleSelect
          name="file_ids"
          options={fileOptions}
          placeholder={formatMessage(messages.attachFiles)}
        />
        <Box mt="16px">
          <FilesUpload
            showInformationSection={false}
            setUploadedFilesList={setFilesUploadedFromSensemaking}
          />
        </Box>
        <Box display="flex" justifyContent="flex-end" mt="16px">
          <Button
            disabled={
              !methods.formState.isDirty || methods.formState.isSubmitting
            }
            buttonStyle="admin-dark"
            type="submit"
          >
            {formatMessage(messages.save)}
          </Button>
        </Box>
      </Box>
    </FormProvider>
  );
};

export default FileSelectionView;
