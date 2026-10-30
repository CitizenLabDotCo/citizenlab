import React, { useState } from 'react';

import {
  Box,
  IconButton,
  Text,
  colors,
  fontSizes,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { useDropzone } from 'react-dropzone';
import TextareaAutosize from 'react-textarea-autosize';
import styled from 'styled-components';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import FileChip from './FileChip';
import messages from './messages';

const ACCEPTED_FILES = {
  'application/pdf': ['.pdf'],
  'text/markdown': ['.md'],
  'text/plain': ['.txt'],
};
// Mirror the limits of AIAssistant::Message on the backend.
const MAX_FILES = 3;
const MAX_FILE_SIZE_MB = 4;
const MAX_CONTENT_LENGTH = 5000;

// A chat-style input: one border around the text, the files and the actions.
const Frame = styled.div`
  border: 1px solid ${colors.borderDark};
  border-radius: ${stylingConsts.borderRadius};
  background: ${colors.white};

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.tenantPrimary};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.tenantPrimary};
  }
`;

const PromptInput = styled(TextareaAutosize)`
  display: block;
  width: 100%;
  padding: 12px 12px 4px;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  color: ${colors.textPrimary};
  font-family: inherit;
  font-size: ${fontSizes.base}px;
  line-height: 1.5;

  // The Frame shows focus instead; the global white ring would hide its border.
  &.focus-visible,
  &:focus-visible {
    outline: none;
    box-shadow: none;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

type Props = {
  prompt: string;
  files: File[];
  // Files can only be shared within a project.
  allowFiles: boolean;
  disabled: boolean;
  sending: boolean;
  onPromptChange: (prompt: string) => void;
  onFilesChange: (files: File[]) => void;
  onSend: () => void;
};

const Composer = ({
  prompt,
  files,
  allowFiles,
  disabled,
  sending,
  onPromptChange,
  onFilesChange,
  onSend,
}: Props) => {
  const { formatMessage } = useIntl();
  const [filesRejected, setFilesRejected] = useState(false);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: ACCEPTED_FILES,
    maxSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    noClick: true,
    noKeyboard: true,
    disabled: disabled || !allowFiles,
    onDrop: (acceptedFiles, rejectedFiles) => {
      const nextFiles = [...files, ...acceptedFiles];
      setFilesRejected(
        rejectedFiles.length > 0 || nextFiles.length > MAX_FILES
      );
      onFilesChange(nextFiles.slice(0, MAX_FILES));
    },
  });

  const canSend = !disabled && (prompt.trim() !== '' || files.length > 0);

  const removeFile = (file: File) => {
    setFilesRejected(false);
    onFilesChange(files.filter((otherFile) => otherFile !== file));
  };

  return (
    <Box {...getRootProps()} position="relative">
      <input {...getInputProps()} />
      {isDragActive && (
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          zIndex="1"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgColor={colors.teal50}
          border={`2px dashed ${colors.teal400}`}
          borderRadius={stylingConsts.borderRadius}
        >
          <Text m="0px" color="teal700">
            <FormattedMessage {...messages.dropFiles} />
          </Text>
        </Box>
      )}
      <Frame>
        <PromptInput
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          placeholder={formatMessage(messages.placeholder)}
          aria-label={formatMessage(messages.placeholder)}
          minRows={3}
          maxRows={8}
          maxLength={MAX_CONTENT_LENGTH}
          disabled={disabled}
        />
        {files.length > 0 && (
          <Box display="flex" flexWrap="wrap" gap="6px" px="12px" pt="4px">
            {files.map((file) => (
              <FileChip
                key={`${file.name}-${file.lastModified}`}
                fileName={file.name}
                onRemove={() => removeFile(file)}
                disabled={disabled}
              />
            ))}
          </Box>
        )}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          p="8px"
        >
          <Box>
            {allowFiles && (
              <IconButton
                iconName="paperclip"
                buttonType="button"
                iconColor={colors.grey700}
                iconColorOnHover={colors.textPrimary}
                a11y_buttonActionMessage={formatMessage(messages.attachFile)}
                onClick={open}
                disabled={disabled}
              />
            )}
          </Box>
          <ButtonWithLink
            type="button"
            icon="stars"
            size="s"
            onClick={onSend}
            disabled={!canSend}
            processing={sending}
          >
            <FormattedMessage {...messages.send} />
          </ButtonWithLink>
        </Box>
      </Frame>
      {filesRejected && (
        <Text m="0px" mt="8px" fontSize="s" color="error">
          <FormattedMessage
            {...messages.filesRejected}
            values={{ maxSizeMb: MAX_FILE_SIZE_MB, maxFiles: MAX_FILES }}
          />
        </Text>
      )}
      {files.length > 0 && (
        <Text m="0px" mt="8px" fontSize="s" color="textSecondary">
          <FormattedMessage {...messages.filesNotice} />
        </Text>
      )}
    </Box>
  );
};

export default Composer;
