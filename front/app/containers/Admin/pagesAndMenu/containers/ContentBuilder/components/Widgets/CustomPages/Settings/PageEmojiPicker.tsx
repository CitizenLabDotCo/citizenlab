import React, { useState, useRef, useEffect } from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import { getEmojiMartLocale } from 'components/HookForm/EmojiPicker/localeMapping';
import Emoji from 'components/UI/Emoji';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

const PickerContainer = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const EmojiButton = styled.button<{ hasValue: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border: 1px solid ${colors.borderDark};
  border-radius: 3px;
  background: ${colors.white};
  cursor: pointer;
  height: 48px;
  width: 80px;

  &:hover {
    border-color: ${colors.grey600};
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  color: ${colors.grey600};
  font-size: 14px;

  &:hover {
    color: ${colors.red500};
  }
`;

const PopoverContainer = styled.div`
  position: absolute;
  bottom: calc(100% + 8px);
  right: 0;
  z-index: 1000;
`;

interface Props {
  value?: string | null;
  onChange: (emoji: string | null) => void;
}

const PageEmojiPicker = ({ value, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <PickerContainer ref={containerRef}>
      <Box display="flex" alignItems="center" gap="12px">
        <EmojiButton
          type="button"
          hasValue={!!value}
          onClick={() => setIsOpen((open) => !open)}
        >
          {value ? (
            <Emoji emoji={value} size="24px" />
          ) : (
            <Text as="span" color="coolGrey500" m="0px" fontSize="xl">
              +
            </Text>
          )}
        </EmojiButton>
        {value && (
          <ClearButton type="button" onClick={() => onChange(null)}>
            {formatMessage(messages.clearIcon)}
          </ClearButton>
        )}
      </Box>
      {isOpen && (
        <PopoverContainer>
          <Picker
            data={data}
            perLine={8}
            locale={getEmojiMartLocale(locale)}
            onEmojiSelect={(emoji: { native: string }) => {
              onChange(emoji.native);
              setIsOpen(false);
            }}
          />
        </PopoverContainer>
      )}
    </PickerContainer>
  );
};

export default PageEmojiPicker;
