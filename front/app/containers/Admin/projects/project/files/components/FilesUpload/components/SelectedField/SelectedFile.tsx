import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Box, Text, Select } from '@citizenlab/cl2-component-library';
import { CLError } from 'typings';

import useAddFile from 'api/files/useAddFile';

import { useIntl } from 'utils/cl-intl';
import { getBase64FromFile } from 'utils/fileUtils';

import { FileWithMeta } from '../../types';
import messages from '../messages';

import { StatusIcon } from './StatusIcon';

type Props = {
  fileMeta: FileWithMeta;
  projectId: string;
  onStatusUpdate: (status: Partial<FileWithMeta>) => void;
};

const SelectedFile = ({ fileMeta, projectId, onStatusUpdate }: Props) => {
  const { formatMessage } = useIntl();
  const { mutate } = useAddFile();
  const { file, status, semanticType } = fileMeta;
  const [apiErrors, setApiErrors] = useState<CLError[] | null>(null);

  // Ref to track if the upload has started
  const hasStarted = useRef(false);

  // Function to upload the file
  const uploadFile = useCallback(async () => {
    const base64 = await getBase64FromFile(file);
    mutate(
      {
        content: base64,
        project: projectId,
        name: file.name,
      },
      {
        onError: (errors) => {
          setApiErrors(errors.error);
          onStatusUpdate({ status: 'error' });
        },
        onSuccess: () => {
          onStatusUpdate({ status: 'uploaded' });
        },
      }
    );
  }, [file, projectId, mutate, onStatusUpdate]);

  useEffect(() => {
    if (status === 'uploading' && !hasStarted.current) {
      hasStarted.current = true;
      uploadFile();
    }
  }, [status, uploadFile]);

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb="8px"
      >
        <Box display="flex" alignItems="center" gap="4px">
          <StatusIcon status={status} apiErrors={apiErrors} />
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
        </Box>
        <Box minWidth="200px">
          <Select
            value={semanticType} // TODO: Replace with actual semantic type once implemented.
            placeholder={formatMessage(messages.selectFileType)}
            onChange={() => {}} // TODO: Implement onChange once SemanticFileType implemented.
            options={[
              // TODO: Replace with actual options once implemented.
              { value: 'type_1', label: 'Type 1' },
              { value: 'type_2', label: 'Type 2' },
            ]}
            disabled={status !== 'queued'}
          />
        </Box>
      </Box>
    </>
  );
};

export default SelectedFile;
