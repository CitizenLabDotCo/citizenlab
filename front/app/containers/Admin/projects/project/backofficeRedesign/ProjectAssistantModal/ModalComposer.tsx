import React, { useRef, useState } from 'react';

import { Box, Icon, Text, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

// The slim chat composer used throughout the modal: a rounded field with a
// paperclip (attach a brief) and a round send button, matching the augur
// prototype. Deliberately lighter than the dock's Composer — here it reads as
// one line in a conversation, not a form.

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
  onSend: (text: string) => void;
};

const ModalComposer = ({ placeholder, disabled, onSend }: Props) => {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string>();
  const fileInput = useRef<HTMLInputElement>(null);

  const canSend = text.trim() !== '' && !disabled;

  const submit = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText('');
    setFileName(undefined);
  };

  return (
    <Box
      border={`1px solid ${colors.grey300}`}
      borderRadius="16px"
      p="14px 16px"
      bgColor={colors.white}
    >
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

      {fileName && (
        <Box
          display="inline-flex"
          alignItems="center"
          gap="6px"
          mt="8px"
          px="10px"
          py="4px"
          borderRadius="8px"
          bgColor={colors.grey100}
        >
          <Icon name="paperclip" width="13px" height="13px" fill={colors.grey700} />
          <Text m="0px" fontSize="s" color="textPrimary">
            {fileName}
          </Text>
        </Box>
      )}

      <Box display="flex" alignItems="center" justifyContent="space-between" mt="10px">
        <IconBtn
          type="button"
          disabled={disabled}
          onClick={() => fileInput.current?.click()}
          aria-label="Attach a brief or plan"
        >
          <Icon name="paperclip" width="20px" height="20px" fill={colors.grey700} />
        </IconBtn>
        <input
          ref={fileInput}
          type="file"
          style={{ display: 'none' }}
          onChange={(e) => setFileName(e.target.files?.[0]?.name)}
        />

        <SendButton type="button" $active={canSend} onClick={submit}>
          <Icon
            name="arrow-up"
            width="18px"
            height="18px"
            fill={canSend ? colors.white : colors.grey600}
          />
        </SendButton>
      </Box>
    </Box>
  );
};

export default ModalComposer;
