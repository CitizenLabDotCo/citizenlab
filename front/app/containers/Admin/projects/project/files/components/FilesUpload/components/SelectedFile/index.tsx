import React, { useCallback, useEffect, useRef } from 'react';

import {
  Box,
  IconButton,
  Text,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import { object, string } from 'yup';

import { FILE_CATEGORIES } from 'api/files/types';
import useAddFile from 'api/files/useAddFile';

import Select from 'components/HookForm/Select';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { getBase64FromFile } from 'utils/fileUtils';

import messages from '../../../messages';
import { FileWithMeta } from '../../types';

import { StatusIcon } from './components/StatusIcon';

type Props = {
  fileMeta: FileWithMeta;
  projectId: string;
  onStatusUpdate: (status: Partial<FileWithMeta>) => void;
};

const SelectedFile = ({ fileMeta, projectId, onStatusUpdate }: Props) => {
  const { formatMessage } = useIntl();
  const { mutateAsync: addFile } = useAddFile();
  const { file, status } = fileMeta;

  // Ref to track if the upload has started
  const hasStarted = useRef(false);

  // Setup for React hook form
  const schema = object({
    category: string().oneOf(FILE_CATEGORIES).nullable().notRequired(), // Will default to 'other' if not selected
  });
  const methods = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  // Function to upload the file
  const uploadFile = useCallback(
    async (formData: FieldValues) => {
      const base64 = await getBase64FromFile(file);

      try {
        await addFile({
          content: base64,
          project: projectId,
          name: file.name,
          category: formData.category || 'other', // Default to 'other' if no category is selected
          ai_processing_allowed: fileMeta.ai_processing_allowed,
        });

        onStatusUpdate({
          status: 'uploaded',
        });
      } catch (error) {
        onStatusUpdate({
          status: 'error',
        });
        handleHookFormSubmissionError(error, methods.setError);
      }
    },
    [
      file,
      addFile,
      projectId,
      fileMeta.ai_processing_allowed,
      onStatusUpdate,
      methods.setError,
    ]
  );

  // Handle form submission (trigger file upload)
  const submit = methods.handleSubmit(async (formData) => {
    await uploadFile(formData);
  });

  // Effect to handle the file upload when the status changes to 'uploading'
  useEffect(() => {
    if (status === 'uploading' && !hasStarted.current) {
      hasStarted.current = true;
      submit();
    }
  }, [methods, status, submit, uploadFile]);

  return (
    <>
      <FormProvider {...methods}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb="8px"
          gap="8px"
        >
          <Box display="flex" alignItems="center" gap="4px">
            <StatusIcon status={status} />
            <Text
              my="4px"
              color={
                status === 'error' || status === 'too_large'
                  ? 'disabled'
                  : 'textSecondary'
              }
              maxWidth="280px"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {file.name}
            </Text>
            {/* Retry upload button if the file has an API error on uploading */}
            {status === 'error' && (
              <Tooltip content={formatMessage(messages.retryUpload)}>
                <IconButton
                  iconName="refresh"
                  aria-label={formatMessage(messages.retryUpload)}
                  onClick={() => {
                    hasStarted.current = false;
                    onStatusUpdate({ status: 'uploading' });
                  }}
                  a11y_buttonActionMessage={formatMessage(messages.retryUpload)}
                />
              </Tooltip>
            )}
          </Box>
          <Box minWidth="200px">
            <form>
              <Select
                name={'category'}
                placeholder={formatMessage(messages.selectFileType)}
                options={FILE_CATEGORIES.map((category) => ({
                  value: category,
                  label: formatMessage(messages[category]),
                }))}
                disabled={status !== 'queued'}
              />
            </form>
          </Box>
        </Box>
      </FormProvider>
    </>
  );
};

export default SelectedFile;
