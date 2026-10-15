import React, { useRef, useState } from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

// The slim chat composer used throughout the modal: a rounded field with a
// paperclip (attach a brief/concept note) and a round send button, matching the
// augur prototype. Files are lifted to the parent so they can be uploaded and
// handed to the real generation engine.

const ACCEPTED = '.pdf,.md,.txt,.doc,.docx';
const MAX_FILES = 3;

const Field = styled.textarea`
  width: 100%;
  border: none;
  resize: none;
  outline: none;
  font-family: inherit;
  font-size: 15px;
  line-height: 1.45;
  color: ${colors.textPrimary};
  background: transparent;
  &::placeholder {
    color: ${colors.grey600};
  }
`;

const SendButton = styled.button<{ $active: boolean }>`
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ $active }) => ($active ? 'pointer' : 'default')};
  background: ${({ $active }) => ($active ? colors.textPrimary : colors.grey200)};
  transition: background 120ms ease;
`;

const IconBtn = styled.button`
  appearance: none;
  border: none;
  background: transparent;
  padding: 4px;
  cursor: pointer;
  display: inline-flex;
  &:disabled {
    opacity: 0.5;
    cursor: default;
  }
`;

type Props = {
  placeholder: string;
  disabled?: boolean;
  files?: File[];
  onFilesChange?: (files: File[]) => void;
  onSend: (text: string) => void;
};

const ModalComposer = ({
  placeholder,
  disabled,
  files = [],
  onFilesChange,
  onSend,
}: Props) => {
  const [text, setText] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  const canSend = text.trim() !== '' && !disabled;

  const submit = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText('');
  };

  const addFiles = (picked: FileList | null) => {
    if (!picked || !onFilesChange) return;
    onFilesChange([...files, ...Array.from(picked)].slice(0, MAX_FILES));
  };

  return (
    <Box border={`1px solid ${colors.grey300}`} borderRadius="16px" p="14px 16px" bgColor={colors.white}>
      <Field
        value={text}
        placeholder={placeholder}
        rows={2}
        disabled={disabled}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
      />

      {files.length > 0 && (
        <Box display="flex" flexWrap="wrap" gap="6px" mt="8px">
          {files.map((file, i) => (
            <Box
              key={`${file.name}-${i}`}
              display="flex"
              alignItems="center"
              gap="6px"
              px="10px"
              py="4px"
              borderRadius="8px"
              bgColor={colors.grey100}
            >
              <Icon name="paperclip" width="13px" height="13px" fill={colors.grey700} />
              <Text m="0px" fontSize="s" color="textPrimary">
                {file.name}
              </Text>
              {onFilesChange && (
                <button
                  type="button"
                  onClick={() => onFilesChange(files.filter((_, j) => j !== i))}
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0, display: 'inline-flex' }}
                  aria-label={`Remove ${file.name}`}
                >
                  <Icon name="close" width="12px" height="12px" fill={colors.grey700} />
                </button>
              )}
            </Box>
          ))}
        </Box>
      )}

      <Box display="flex" alignItems="center" justifyContent="space-between" mt="10px">
        <IconBtn
          type="button"
          disabled={disabled || !onFilesChange || files.length >= MAX_FILES}
          onClick={() => fileInput.current?.click()}
          aria-label="Attach a brief or plan"
        >
          <Icon name="paperclip" width="20px" height="20px" fill={colors.grey700} />
        </IconBtn>
        <input
          ref={fileInput}
          type="file"
          accept={ACCEPTED}
          multiple
          style={{ display: 'none' }}
          onChange={(e) => addFiles(e.target.files)}
        />

        <SendButton type="button" $active={canSend} onClick={submit}>
          <Icon name="arrow-up" width="18px" height="18px" fill={canSend ? colors.white : colors.grey600} />
        </SendButton>
      </Box>
    </Box>
  );
};

export default ModalComposer;
