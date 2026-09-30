import React, { useState } from 'react';

import {
  Box,
  Icon,
  IconButton,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { useDropzone } from 'react-dropzone';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import TextArea from 'components/UI/TextArea';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

const ACCEPTED_FILES = {
  'application/pdf': ['.pdf'],
  'text/markdown': ['.md'],
  'text/plain': ['.txt'],
};
const MAX_FILES = 3;
const MAX_FILE_SIZE_MB = 10;
export const MAX_PROMPT_LENGTH = 5000;

type Props = {
  prompt: string;
  files: File[];
  busy: boolean;
  onPromptChange: (prompt: string) => void;
  onFilesChange: (files: File[]) => void;
  onSend: () => void;
};

const Composer = ({
  prompt,
  files,
  busy,
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
    disabled: busy,
    onDrop: (acceptedFiles, rejectedFiles) => {
      const nextFiles = [...files, ...acceptedFiles];
      setFilesRejected(rejectedFiles.length > 0 || nextFiles.length > MAX_FILES);
      onFilesChange(nextFiles.slice(0, MAX_FILES));
    },
  });

  const canSend =
    !busy &&
    (prompt.trim() !== '' || files.length > 0) &&
    prompt.length <= MAX_PROMPT_LENGTH;

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
      <TextArea
        value={prompt}
        onChange={onPromptChange}
        placeholder={formatMessage(messages.placeholder)}
        rows={4}
        maxCharCount={MAX_PROMPT_LENGTH}
        disabled={busy}
      />
      {files.length > 0 && (
        <Box display="flex" flexWrap="wrap" gap="6px" mt="8px">
          {files.map((file) => (
            <Box
              key={`${file.name}-${file.lastModified}`}
              display="flex"
              alignItems="center"
              gap="4px"
              pl="8px"
              bgColor={colors.grey100}
              borderRadius={stylingConsts.borderRadius}
              maxWidth="100%"
            >
              <Icon name="file" width="14px" height="14px" fill={colors.grey700} />
              <Text m="0px" fontSize="s" overflow="hidden" whiteSpace="nowrap">
                {file.name}
              </Text>
              <IconButton
                iconName="close"
                buttonType="button"
                iconWidth="14px"
                iconHeight="14px"
                iconColor={colors.grey700}
                iconColorOnHover={colors.textPrimary}
                a11y_buttonActionMessage={formatMessage(messages.removeFile, {
                  fileName: file.name,
                })}
                onClick={() => removeFile(file)}
                disabled={busy}
              />
            </Box>
          ))}
        </Box>
      )}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mt="8px"
      >
        <IconButton
          iconName="paperclip"
          buttonType="button"
          iconColor={colors.grey700}
          iconColorOnHover={colors.textPrimary}
          a11y_buttonActionMessage={formatMessage(messages.attachFile)}
          onClick={open}
          disabled={busy}
        />
        <ButtonWithLink
          type="button"
          icon="stars"
          size="s"
          onClick={onSend}
          disabled={!canSend}
          processing={busy}
        >
          <FormattedMessage {...messages.draftButton} />
        </ButtonWithLink>
      </Box>
      {filesRejected && (
        <Text m="0px" mt="8px" fontSize="s" color="error">
          <FormattedMessage
            {...messages.filesHint}
            values={{ maxFiles: MAX_FILES }}
          />
        </Text>
      )}
      {files.length > 0 && (
        <Text m="0px" mt="8px" fontSize="s" color="textSecondary">
          <FormattedMessage {...messages.filesHint} values={{ maxFiles: MAX_FILES }} />
        </Text>
      )}
    </Box>
  );
};

export default Composer;
