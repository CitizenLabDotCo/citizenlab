import React, { KeyboardEvent, useRef, useState } from 'react';

import {
  Box,
  ClickOutside,
  Icon,
  IconButton,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import TagPickerPopover, { TagOption } from './TagPickerPopover';

// A dashed pill isn't a Button style, so it gets its own small styled button.
const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 26px;
  padding: 0 12px;
  border: 1px dashed ${colors.grey300};
  border-radius: 999px;
  background: none;
  font: inherit;
  font-size: 14px;
  color: ${colors.coolGrey600};
  cursor: pointer;

  svg {
    fill: currentColor;
  }

  &:hover,
  &[aria-expanded='true'] {
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
        <Box
          key={value}
          display="inline-flex"
          alignItems="center"
          gap="4px"
          height="26px"
          pl="11px"
          pr="5px"
          borderRadius="999px"
          background={colors.grey200}
        >
          <Text as="span" m="0" fontSize="s" color="primary">
            {label}
          </Text>
          <IconButton
            iconName="close"
            iconWidth="12px"
            iconHeight="12px"
            iconColor={colors.coolGrey600}
            iconColorOnHover={colors.primary}
            a11y_buttonActionMessage={formatMessage(messages.removeTag, {
              tag: label,
            })}
            onClick={() => onChange(selected.filter((id) => id !== value))}
          />
        </Box>
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
          <Icon name="plus" width="14px" height="14px" />
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
