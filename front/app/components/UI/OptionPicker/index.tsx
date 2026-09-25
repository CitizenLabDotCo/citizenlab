import React, { useRef, useState } from 'react';

import {
  Box,
  Button,
  Dropdown,
  Icon,
  IconNames,
  Input,
  Text,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import OptionRow from 'components/UI/OptionRow';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const Search = styled(Box)`
  input {
    height: 36px;
    border-radius: ${bo.borderRadius};
  }
`;

const TriggerContent = styled(Box)`
  min-width: 0;

  & > svg {
    flex: none;
  }
`;

const Label = styled.span`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export interface PickerOption<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon: IconNames;
}

interface Props<T extends string> {
  title: string;
  description: string;
  options: PickerOption<T>[];
  value: T;
  onChange: (value: T) => void;
  searchPlaceholder?: string;
}

const OptionPicker = <T extends string>({
  title,
  description,
  options,
  value,
  onChange,
  searchPlaceholder,
}: Props<T>) => {
  const { formatMessage } = useIntl();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [opened, setOpened] = useState(false);
  const [search, setSearch] = useState('');

  const close = () => {
    setOpened(false);
    setSearch('');
  };

  const dismiss = () => {
    close();
    triggerRef.current?.focus();
  };

  const selected = options.find((option) => option.value === value);

  const query = search.trim().toLowerCase();
  const visibleOptions = options.filter((option) =>
    option.label.toLowerCase().includes(query)
  );

  return (
    <Box
      position="relative"
      display="inline-block"
      maxWidth="100%"
      onKeyDown={(event: React.KeyboardEvent) => {
        if (event.key === 'Escape' && opened) dismiss();
      }}
    >
      <Button
        type="button"
        ref={triggerRef}
        buttonStyle="bo-picker"
        width="auto"
        maxWidth="100%"
        bgColor={opened ? colors.grey200 : undefined}
        icon="chevron-down"
        iconPos="right"
        ariaExpanded={opened}
        ariaHasPopup="true"
        onClick={() => (opened ? close() : setOpened(true))}
      >
        <TriggerContent display="flex" alignItems="center" gap="8px">
          {selected && (
            <Icon
              name={selected.icon}
              width="16px"
              height="16px"
              fill={colors.coolGrey500}
            />
          )}
          <Label>{selected?.label}</Label>
        </TriggerContent>
      </Button>

      <Dropdown
        opened={opened}
        onClickOutside={({ target }) => {
          if (target instanceof Node && triggerRef.current?.contains(target)) {
            return;
          }
          close();
        }}
        top="calc(100% + 4px)"
        left="0px"
        width="288px"
        maxHeight="320px"
        zIndex="1000"
        content={
          <Box>
            <Box pb="8px" mb="8px" borderBottom={`1px solid ${colors.grey200}`}>
              <Text variant="bo-section">{title}</Text>
              <Text variant="bo-helper" mt="2px">
                {description}
              </Text>
            </Box>

            {searchPlaceholder && (
              <Search mb="8px">
                <Input
                  type="text"
                  size="small"
                  value={search}
                  placeholder={searchPlaceholder}
                  ariaLabel={searchPlaceholder}
                  onChange={setSearch}
                />
              </Search>
            )}

            <Box
              role="radiogroup"
              aria-label={title}
              display="flex"
              flexDirection="column"
            >
              {visibleOptions.map((option) => (
                <OptionRow
                  key={option.value}
                  icon={option.icon}
                  label={option.label}
                  description={option.description}
                  selected={option.value === value}
                  onClick={() => {
                    onChange(option.value);
                    dismiss();
                  }}
                />
              ))}
              {visibleOptions.length === 0 && (
                <Text variant="bo-helper" p="8px">
                  {formatMessage(messages.noResults)}
                </Text>
              )}
            </Box>
          </Box>
        }
      />
    </Box>
  );
};

export default OptionPicker;
