import React, { useState, useRef, useEffect } from 'react';

import { Box, Label, colors, Text } from '@citizenlab/cl2-component-library';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Controller, useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { CLError, RHFErrors } from 'typings';

import useLocale from 'hooks/useLocale';

import Emoji from 'components/UI/Emoji';
import Error, { TFieldName } from 'components/UI/Error';

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

const PopoverContainer = styled.div`
  position: absolute;
  top: 56px;
  right: 0;
  z-index: 1000;
`;

interface Props {
  name: string;
  label?: string;
}

const EmojiPicker = ({ name, label }: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    formState: { errors: formContextErrors },
    control,
  } = useFormContext();

  const errors = formContextErrors[name] as RHFErrors;
  const validationError = errors?.message;
  const apiError = errors?.error && ([errors] as CLError[]);

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
    <Box>
      {label && <Label htmlFor={name}>{label}</Label>}
      <Controller
        name={name}
        control={control}
        defaultValue={null}
        render={({ field: { value, onChange } }) => (
          <PickerContainer ref={containerRef}>
            <Box display="flex" alignItems="center" gap="8px">
              <EmojiButton
                type="button"
                hasValue={!!value}
                onClick={() => setIsOpen(!isOpen)}
                id={name}
              >
                {value ? (
                  <Emoji emoji={value} size="24px" />
                ) : (
                  <Text color="coolGrey500" m="0px" fontSize="xl">
                    +
                  </Text>
                )}
              </EmojiButton>
              {value && (
                <ClearButton
                  type="button"
                  onClick={() => onChange(null)}
                  aria-label={formatMessage(messages.clearEmoji)}
                >
                  {formatMessage(messages.clearEmoji)}
                </ClearButton>
              )}
            </Box>
            {isOpen && (
              <PopoverContainer>
                <Picker
                  data={data}
                  locale={getEmojiMartLocale(locale)}
                  onEmojiSelect={(emoji: { native: string }) => {
                    onChange(emoji.native);
                    setIsOpen(false);
                  }}
                />
              </PopoverContainer>
            )}
          </PickerContainer>
        )}
      />
      {validationError && (
        <Error
          marginTop="8px"
          marginBottom="8px"
          text={validationError}
          scrollIntoView={false}
        />
      )}
      {apiError && (
        <Error
          fieldName={name as TFieldName}
          apiErrors={apiError}
          marginTop="8px"
          marginBottom="8px"
          scrollIntoView={false}
        />
      )}
    </Box>
  );
};

export default EmojiPicker;
