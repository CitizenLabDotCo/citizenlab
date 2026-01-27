import React, { useState, useRef, useEffect } from 'react';

import { Box, Label, colors, Text } from '@citizenlab/cl2-component-library';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Controller, useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { CLError, RHFErrors } from 'typings';

import Emoji from 'components/UI/Emoji';
import Error, { TFieldName } from 'components/UI/Error';

const PickerContainer = styled.div`
  position: relative;
`;

const EmojiButton = styled.button<{ hasValue: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid ${colors.grey400};
  border-radius: 3px;
  background: ${colors.white};
  cursor: pointer;
  min-height: 48px;
  min-width: 120px;

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
  left: 0;
  z-index: 1000;
`;

interface Props {
  name: string;
  label?: string;
}

const EmojiPicker = ({ name, label }: Props) => {
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
                  <Text color="coolGrey600" m="0px">
                    Select emoji
                  </Text>
                )}
              </EmojiButton>
              {value && (
                <ClearButton
                  type="button"
                  onClick={() => onChange(null)}
                  aria-label="Clear emoji"
                >
                  Clear
                </ClearButton>
              )}
            </Box>
            {isOpen && (
              <PopoverContainer>
                <Picker
                  data={data}
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
