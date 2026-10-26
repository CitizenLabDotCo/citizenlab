import React, { useLayoutEffect, useRef, useState } from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

// The slim chat composer used throughout the modal: a rounded field with a
// paperclip (attach a brief/concept note) and a round send button, matching the
// augur prototype. Files are lifted to the parent so they can be uploaded and
// handed to the real generation engine.

const ACCEPTED = '.pdf,.md,.txt,.doc,.docx';
const MAX_FILES = 3;

// Auto-grow bounds for the textarea: starts around two rows and grows to fit
// content, then scrolls internally once it gets tall.
const MIN_FIELD_HEIGHT = 44; // ~2 rows at 15px / 1.45 line-height
const MAX_FIELD_HEIGHT = 160; // ~6–8 lines before it scrolls instead of growing

// A soft rounded frame that owns the only visible border; it lifts gently on
// focus (no hard outline), matching the prototype's clean composer.
const Frame = styled.div`
  border: 1px solid ${colors.grey300};
  border-radius: 16px;
  padding: 14px 16px;
  background: ${colors.white};
  transition: border-color 120ms ease, box-shadow 120ms ease;
  &:focus-within {
    border-color: ${colors.teal400};
    box-shadow: 0 0 0 3px rgba(4, 139, 168, 0.12);
  }
`;

const Field = styled.textarea`
  width: 100%;
  border: none;
  resize: none;
  display: block;
  min-height: ${MIN_FIELD_HEIGHT}px;
  max-height: ${MAX_FIELD_HEIGHT}px;
  overflow-y: auto;
  font-family: inherit;
  font-size: 15px;
  line-height: 1.45;
  color: ${colors.textPrimary};
  background: transparent;
  /* Kill the field's own outline/border in every state — the Frame is the only
     thing that should show focus. */
  outline: none;
  box-shadow: none;
  &:focus,
  &:focus-visible {
    outline: none;
    box-shadow: none;
    border: none;
  }
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
  const fieldRef = useRef<HTMLTextAreaElement>(null);

  const canSend = text.trim() !== '' && !disabled;

  // Grow the field to fit its content, capped at MAX_FIELD_HEIGHT (beyond which
  // overflow-y handles scrolling). Reset to 'auto' first so it can also shrink.
  const autoSize = () => {
    const el = fieldRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_FIELD_HEIGHT)}px`;
  };

  // Keep the height in sync with the value on mount and after it changes
  // (including the reset to '' after send, which shrinks it back to minimum).
  useLayoutEffect(autoSize, [text]);

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
    <Frame>
      <Field
        ref={fieldRef}
        value={text}
        placeholder={placeholder}
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
    </Frame>
  );
};

export default ModalComposer;
