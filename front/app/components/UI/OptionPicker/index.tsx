import React, { useLayoutEffect, useRef, useState } from 'react';

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

const GAP = 4;

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

const CLIPPING_OVERFLOW = ['auto', 'scroll', 'hidden', 'clip', 'overlay'];

const getVisibleBounds = (element: HTMLElement) => {
  let top = 0;
  let bottom = window.innerHeight;

  for (
    let ancestor = element.parentElement;
    ancestor && ancestor !== document.body;
    ancestor = ancestor.parentElement
  ) {
    if (CLIPPING_OVERFLOW.includes(getComputedStyle(ancestor).overflowY)) {
      const rect = ancestor.getBoundingClientRect();
      top = Math.max(top, rect.top);
      bottom = Math.min(bottom, rect.bottom);
    }
  }

  return { top, bottom };
};

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
  triggerLabel?: string;
  keepOpenFor?: T;
  children?: React.ReactNode;
}

const OptionPicker = <T extends string>({
  title,
  description,
  options,
  value,
  onChange,
  searchPlaceholder,
  triggerLabel,
  keepOpenFor,
  children,
}: Props<T>) => {
  const { formatMessage } = useIntl();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [search, setSearch] = useState('');

  const close = () => {
    setOpened(false);
    setSearch('');
  };

  // flip the dropdown to open upwards if there is not enough space below
  useLayoutEffect(() => {
    if (!opened) return;

    const panel = contentRef.current?.offsetParent;
    const triggerElement = triggerRef.current;
    if (!(panel instanceof HTMLElement) || !triggerElement) return;

    const trigger = triggerElement.getBoundingClientRect();
    const bounds = getVisibleBounds(triggerElement);
    const spaceBelow = bounds.bottom - trigger.bottom - GAP;
    const spaceAbove = trigger.top - bounds.top - GAP;
    setOpenUp(
      panel.offsetHeight > spaceBelow && panel.offsetHeight <= spaceAbove
    );
  }, [opened]);

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
          <Label>{triggerLabel ?? selected?.label}</Label>
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
        top={openUp ? undefined : `calc(100% + ${GAP}px)`}
        bottom={openUp ? `calc(100% + ${GAP}px)` : undefined}
        left="0px"
        width="288px"
        maxHeight="320px"
        zIndex="1000"
        borderRadius={bo.borderRadius}
        content={
          <Box ref={contentRef}>
            <Box pb="8px" mb="8px" borderBottom={`1px solid ${colors.grey200}`}>
              <Text variant="boSection">{title}</Text>
              <Text variant="boHelper" mt="2px">
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
                    if (option.value !== value) onChange(option.value);
                    if (option.value !== keepOpenFor) dismiss();
                  }}
                />
              ))}
              {visibleOptions.length === 0 && (
                <Text variant="boHelper" p="8px">
                  {formatMessage(messages.noResults)}
                </Text>
              )}
            </Box>

            {children}
          </Box>
        }
      />
    </Box>
  );
};

export default OptionPicker;
