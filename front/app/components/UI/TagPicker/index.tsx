import React, { KeyboardEvent, useRef, useState } from 'react';

import {
  Box,
  ClickOutside,
  Icon,
  IconButton,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';
import { hexToRGBA } from 'utils/helperUtils';

import messages from './messages';
import TagPickerPopover, { TagOption } from './TagPickerPopover';

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 5px 0 11px;
  border-radius: 999px;
  background: ${hexToRGBA(colors.primary, 0.1)};
  font-size: 12.5px;
  line-height: 1;
  color: ${colors.primary};

  button {
    width: 16px;
    height: 16px;
    padding: 0;
    border-radius: 50%;
    opacity: 0.55;
    transition: opacity 0.12s, background 0.12s;

    &:hover,
    &:focus-visible {
      opacity: 1;
      background: ${hexToRGBA(colors.primary, 0.16)};
    }
  }
`;

const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 12px 0 10px;
  border: 1px dashed ${colors.grey300};
  border-radius: 999px;
  background: none;
  font: inherit;
  font-size: 12.5px;
  line-height: 1;
  color: ${colors.coolGrey600};
  cursor: pointer;

  svg {
    fill: currentColor;
  }

  &:hover {
    border-color: ${colors.primary};
    color: ${colors.primary};
  }
`;

interface Props {
  options: TagOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

const TagPicker = ({ options, selected, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const selectedOptions = options.filter(({ value }) =>
    selected.includes(value)
  );

  const close = () => {
    setOpened(false);
    addButtonRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape' || !opened) return;
    event.stopPropagation();
    close();
  };

  return (
    <Box
      position="relative"
      display="flex"
      flexWrap="wrap"
      alignItems="center"
      gap="6px"
      onKeyDown={handleKeyDown}
    >
      {selectedOptions.map(({ value, label }) => (
        <Pill key={value}>
          {label}
          <IconButton
            iconName="close"
            iconWidth="11px"
            iconHeight="11px"
            iconColor={colors.primary}
            iconColorOnHover={colors.primary}
            a11y_buttonActionMessage={formatMessage(messages.removeTag, {
              tag: label,
            })}
            onClick={() => onChange(selected.filter((id) => id !== value))}
          />
        </Pill>
      ))}
      <ClickOutside
        onClickOutside={() => setOpened(false)}
        closeOnClickOutsideEnabled={opened}
      >
        <AddButton
          ref={addButtonRef}
          type="button"
          aria-expanded={opened}
          aria-haspopup="dialog"
          onClick={() => (opened ? close() : setOpened(true))}
        >
          <Icon name="plus" width="13px" height="13px" />
          {formatMessage(messages.addTags)}
        </AddButton>
        {opened && (
          <TagPickerPopover
            options={options}
            selected={selected}
            onToggle={(value) =>
              onChange(
                selected.includes(value)
                  ? selected.filter((id) => id !== value)
                  : [...selected, value]
              )
            }
            onClose={close}
          />
        )}
      </ClickOutside>
    </Box>
  );
};

export default TagPicker;
