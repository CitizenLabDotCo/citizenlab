import React, { useCallback, useEffect, useRef } from 'react';

import {
  Box,
  IconButton,
  Text,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { object, string } from 'yup';

import useAddFile from 'api/files/useAddFile';

import Select from 'components/HookForm/Select';

import { useIntl } from 'utils/cl-intl';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { getBase64FromFile } from 'utils/fileUtils';

import { FileWithMeta } from '../../types';
import messages from '../messages';

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
    semantic_type: string() // TODO: Replace with actual SemanticFileType when ready and create separate Type in another file.
      .oneOf(['meeting', 'interview', 'other'])
      .nullable()
      .notRequired(),
  });
  const methods = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
  });

  // Function to upload the file
  const uploadFile = useCallback(
    async (_semantic_type) => {
      // TODO: Replace with actual semantic type once implemented
      const base64 = await getBase64FromFile(file);

      try {
        await addFile({
          content: base64,
          project: projectId,
          name: file.name,
          // semantic_type  TODO: Replace with actual semantic type once BE implemented.
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
    [file, addFile, projectId, methods.setError, onStatusUpdate]
  );

  // Handle form submission (trigger file upload)
  const submit = methods.handleSubmit(async (formData) => {
    await uploadFile(formData.semantic_type);
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
              maxWidth="320px"
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {file.name}
            </Text>
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
                name={'semantic_type'}
                placeholder={formatMessage(messages.selectFileType)}
                options={[
                  // TODO: Replace with actual options once implemented.
                  { value: 'meeting', label: 'Meeting' },
                  { value: 'interview', label: 'Interview' },
                  { value: 'other', label: 'Other' },
                ]}
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
