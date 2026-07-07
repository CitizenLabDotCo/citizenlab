import React, { useState, useRef, useEffect } from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import styled from 'styled-components';

import useLocale from 'hooks/useLocale';

import Emoji from 'components/UI/Emoji';

import { useIntl } from 'utils/cl-intl';

import { getEmojiMartLocale } from './localeMapping';
import messages from './messages';

const PickerContainer = styled.div`
  position: relative;
`;

const EmojiButton = styled.button<{ hasValue: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid ${colors.borderDark};
  border-radius: 3px;
  background: ${colors.white};
  cursor: pointer;
  min-height: 48px;
  width: 80px;

  &:hover {
    border-color: ${colors.grey600};
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 2px ${colors.primary}20;
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

const PopoverContainer = styled.div<{ placement: 'top' | 'bottom' }>`
  position: absolute;
  right: 0;
  z-index: 1000;
  ${({ placement }) =>
    placement === 'top' ? 'bottom: calc(100% + 8px);' : 'top: 56px;'}
`;

export interface Props {
  value?: string | null;
  onChange: (emoji: string | null) => void;
  placement?: 'top' | 'bottom';
  id?: string;
}

const EmojiPickerInput = ({
  value,
  onChange,
  placement = 'bottom',
  id,
}: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close picker
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
      <Box display="flex" alignItems="center" gap="8px">
        <EmojiButton
          type="button"
          hasValue={!!value}
          onClick={() => setIsOpen((open) => !open)}
          id={id}
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
          <ClearButton
            type="button"
            onClick={() => onChange(null)}
            aria-label={formatMessage(messages.clear)}
          >
            {formatMessage(messages.clear)}
          </ClearButton>
        )}
      </Box>
      {isOpen && (
        <PopoverContainer placement={placement}>
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

export default EmojiPickerInput;
