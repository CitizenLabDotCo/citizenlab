import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  Box,
  Icon,
  Text,
  Spinner,
  colors,
  Select,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { CLError } from 'typings';

import useAddFile from 'api/files/useAddFile';

import Error from 'components/UI/Error';

import { useIntl } from 'utils/cl-intl';
import { getBase64FromFile } from 'utils/fileUtils';

import { FileWithMeta } from '../types';

import messages from './messages';

type Props = {
  fileMeta: FileWithMeta;
  projectId: string;
  onStatusUpdate: (status: Partial<FileWithMeta>) => void;
};

const SelectedFile = ({ fileMeta, projectId, onStatusUpdate }: Props) => {
  const { formatMessage } = useIntl();
  const { mutateAsync } = useAddFile();
  const { file, status, semanticType } = fileMeta;
  const [apiErrors, setApiErrors] = useState<CLError[] | null>(null);

  // Ref to track if the upload has started
  const hasStarted = useRef(false);

  // Function to upload the file
  const uploadFile = useCallback(async () => {
    const base64 = await getBase64FromFile(file);
    await mutateAsync(
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
  }, [file, projectId, mutateAsync, onStatusUpdate]);

  // Effect to handle the file upload when the status changes to 'uploading'
  useEffect(() => {
    if (status === 'uploading' && !hasStarted.current) {
      hasStarted.current = true;
      uploadFile();
    }
  }, [status, uploadFile]);

  // Render the appropriate icon based on the file's upload status
  const renderIcon = () => {
    switch (status) {
      case 'uploaded':
        return <Icon name="check" fill={colors.green500} />;
      case 'error':
        return (
          <Tooltip
            content={
              <Error
                apiErrors={apiErrors}
                showBackground={false}
                showIcon={false}
                marginTop="0px"
                marginBottom="0px"
              />
            }
          >
            <Icon fill={colors.red500} name="info-outline" />
          </Tooltip>
        );
      case 'uploading':
        return (
          <Box width="24px">
            <Spinner size="24px" />
          </Box>
        );
      case 'too_large':
        return (
          <Tooltip
            content={
              <Error
                text={
                  <Text m="0px" color="red500" fontSize="s">
                    {formatMessage(messages.fileSizeError)}
                  </Text>
                }
                showBackground={false}
                showIcon={false}
                marginTop="0px"
                marginBottom="0px"
              />
            }
          >
            <Icon fill={colors.red500} name="info-outline" />
          </Tooltip>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb="8px"
      >
        <Box display="flex" alignItems="center" gap="4px">
          {renderIcon()}
          <Text
            my="4px"
            color={
              status === 'error' || status === 'too_large'
                ? 'disabled'
                : 'textSecondary'
            }
            maxWidth="200px"
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
