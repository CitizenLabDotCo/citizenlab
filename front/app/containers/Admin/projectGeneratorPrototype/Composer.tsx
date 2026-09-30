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

// prototype data — adapted from Achraf's survey-generator Composer. A brief plus
// up to three reference documents (concept note, memo, plan) the assistant reads
// alongside the brief.
const ACCEPTED_FILES = {
  'application/pdf': ['.pdf'],
  'text/markdown': ['.md'],
  'text/plain': ['.txt'],
};
const MAX_FILES = 3;

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
  const [dragging, setDragging] = useState(false);

  const { getRootProps, getInputProps, open } = useDropzone({
    accept: ACCEPTED_FILES,
    noClick: true,
    noKeyboard: true,
    disabled: busy,
    onDragEnter: () => setDragging(true),
    onDragLeave: () => setDragging(false),
    onDrop: (accepted) => {
      setDragging(false);
      onFilesChange([...files, ...accepted].slice(0, MAX_FILES));
    },
  });

  const canSend = !busy && (prompt.trim() !== '' || files.length > 0);

  const removeFile = (file: File) =>
    onFilesChange(files.filter((other) => other !== file));

  return (
    <Box {...getRootProps()} position="relative">
      <input {...getInputProps()} />
      {dragging && (
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
            Drop your document here
          </Text>
        </Box>
      )}
      <TextArea
        value={prompt}
        onChange={onPromptChange}
        placeholder="Describe your project in a sentence or two…"
        rows={4}
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
            >
              <Icon name="file" width="14px" height="14px" fill={colors.grey700} />
              <Text m="0px" fontSize="s">
                {file.name}
              </Text>
              <IconButton
                iconName="close"
                buttonType="button"
                iconWidth="14px"
                iconHeight="14px"
                iconColor={colors.grey700}
                iconColorOnHover={colors.textPrimary}
                a11y_buttonActionMessage={`Remove ${file.name}`}
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
          a11y_buttonActionMessage="Attach a document"
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
          Draft my project
        </ButtonWithLink>
      </Box>
      {files.length > 0 && (
        <Text m="0px" mt="8px" fontSize="s" color="textSecondary">
          The assistant reads your documents to ground the draft. PDF, Markdown
          or text, up to {MAX_FILES}.
        </Text>
      )}
    </Box>
  );
};

export default Composer;
