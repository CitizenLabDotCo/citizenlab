import React, { useState } from 'react';

import {
  Box,
  IconButton,
  Text,
  bo,
  boFocusRing,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { ErrorCode, useDropzone } from 'react-dropzone';
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
const MAX_TEXT_FILE_SIZE_KB = 100;
const MAX_CONTENT_LENGTH = 5000;

// The dropzone's maxSize applies to every file, and text files have a lower limit.
const validateTextFileSize = (file: File) =>
  file.type !== 'application/pdf' && file.size > MAX_TEXT_FILE_SIZE_KB * 1024
    ? { code: ErrorCode.FileTooLarge, message: 'The text file is too large.' }
    : null;

// A chat-style input: one border around the text, the files and the actions.
const Frame = styled.div`
  border: 1px solid ${colors.grey300};
  border-radius: ${bo.borderRadius};
  background: ${colors.white};
  transition: border-color 100ms ease-out, box-shadow 100ms ease-out;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.tenantPrimary};
    box-shadow: ${({ theme }) => boFocusRing(theme.colors.tenantPrimary)};
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
  color: ${bo.colors.textHeadingStrong};
  font-family: inherit;
  font-size: ${fontSizes.xs}px;
  line-height: 1.5;

  &::placeholder {
    color: ${colors.coolGrey500};
  }

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
  placeholder?: string;
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
  placeholder,
  onPromptChange,
  onFilesChange,
  onSend,
}: Props) => {
  const { formatMessage } = useIntl();
  const promptPlaceholder = placeholder ?? formatMessage(messages.placeholder);
  const [filesRejected, setFilesRejected] = useState(false);
  const canAttachFiles = allowFiles && !disabled;

  // Never disabled: a disabled dropzone leaves drops to the browser, which opens the file.
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: ACCEPTED_FILES,
    maxSize: MAX_FILE_SIZE_MB * 1024 * 1024,
    validator: validateTextFileSize,
    noClick: true,
    noKeyboard: true,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (!canAttachFiles) return;

      const nextFiles = [
        ...files,
        ...acceptedFiles.filter(
          (file) =>
            !files.some(
              (otherFile) =>
                otherFile.name === file.name &&
                otherFile.lastModified === file.lastModified
            )
        ),
      ];
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
      {isDragActive && canAttachFiles && (
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
          borderRadius={bo.borderRadius}
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
          placeholder={promptPlaceholder}
          aria-label={promptPlaceholder}
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
            buttonStyle="bo-primary"
            boSize="medium"
            icon="stars"
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
            {...messages.filesRejected2}
            values={{
              maxSizeMb: MAX_FILE_SIZE_MB,
              maxTextSizeKb: MAX_TEXT_FILE_SIZE_KB,
              maxFiles: MAX_FILES,
            }}
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
