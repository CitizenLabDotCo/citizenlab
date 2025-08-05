import React, { useCallback, useEffect } from 'react';

import { Box, Text, Title } from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { array, object, string } from 'yup';

import useUpdateAnalysis from 'api/analyses/useUpdateAnalysis';
import useFiles from 'api/files/useFiles';

import FilesUpload from 'containers/Admin/projects/project/files/components/FilesUpload';
import { FileWithMeta } from 'containers/Admin/projects/project/files/components/FilesUpload/types';

import MultipleSelect from 'components/HookForm/MultipleSelect';
import GoBackButton from 'components/UI/GoBackButton';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

type Props = {
  setIsFileSelectionOpen: (isOpen: boolean) => void;
  analysisId: string;
};

const FileSelectionView = ({ setIsFileSelectionOpen, analysisId }: Props) => {
  const projectId = useParams<{ projectId: string }>().projectId;
  const { mutate: updateAnalysis } = useUpdateAnalysis();

  const { data: files } = useFiles({
    project: [projectId || ''],
    enabled: !!projectId,
  }); // TODO: Add a whitelisting mechanism to only fetch files that can be added to an analysis.

  const { formatMessage } = useIntl();

  // React Hook Form setup
  const schema = object({
    file_ids: array().of(string().required()).default([]),
  });

  type FormData = {
    file_ids: string[];
  };

  const methods = useForm<FormData>({
    mode: 'onBlur',
    defaultValues: {
      file_ids: [],
    },
    resolver: yupResolver(schema),
  });

  // Watch for changes in file_ids
  const watchedFileIds = useWatch({
    control: methods.control,
    name: 'file_ids',
  });

  const onFormSubmit = useCallback(async () => {
    updateAnalysis({
      id: analysisId,
      files: watchedFileIds,
    });
    // TODO: Handle any errors here once the BE is implemented.
  }, [analysisId, updateAnalysis, watchedFileIds]);

  // Auto-submit when file_ids changes
  useEffect(() => {
    methods.handleSubmit(onFormSubmit)();
  }, [watchedFileIds, methods, onFormSubmit]);

  const fileOptions =
    files?.data.map((file) => ({
      value: file.id,
      label: file.attributes.name,
    })) || [];

  // Function to add any newly uploaded files to the selection
  const addNewlyUploadedFilesToSelection = useCallback(
    (uploadedFiles: FileWithMeta[]) => {
      const currentFiles = methods.getValues('file_ids');

      // Extract the IDs of the newly uploaded files
      const newFileIds = uploadedFiles
        .map((file) => file.id)
        .filter((fileId): fileId is string => fileId !== undefined);

      // Update the form state with the new file IDs
      const newValues: string[] = [...currentFiles, ...newFileIds];
      methods.setValue('file_ids', newValues, { shouldDirty: true });
    },
    [methods]
  );

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
            {formatMessage(messages.attachFilesWithCurrentCount, {
              numberAttachedFiles: watchedFileIds.length || 0,
            })}
          </Title>
        </Box>
        <Text>{formatMessage(messages.attachFilesDescription)}</Text>

        <MultipleSelect
          name="file_ids"
          options={fileOptions}
          placeholder={formatMessage(messages.attachFilesFromProject)}
        />
        <Box mt="16px">
          <FilesUpload
            showInformationSection={false}
            afterUpload={addNewlyUploadedFilesToSelection}
            showTitle={false}
          />
        </Box>
      </Box>
    </FormProvider>
  );
};

export default FileSelectionView;
