import React, { useState } from 'react';

import {
  Box,
  IconButton,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { useDropzone } from 'react-dropzone';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import TextArea from 'components/UI/TextArea';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import FileChip from './FileChip';
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
      setFilesRejected(
        rejectedFiles.length > 0 || nextFiles.length > MAX_FILES
      );
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
            <FileChip
              key={`${file.name}-${file.lastModified}`}
              fileName={file.name}
              onRemove={() => removeFile(file)}
              disabled={busy}
            />
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
          <FormattedMessage {...messages.send} />
        </ButtonWithLink>
      </Box>
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
