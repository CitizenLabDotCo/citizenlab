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
const MAX_HEIGHT = 320;
const DROPDOWN_MARGIN = 20;

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
  let right = window.innerWidth;

  for (
    let ancestor = element.parentElement;
    ancestor && ancestor !== document.body;
    ancestor = ancestor.parentElement
  ) {
    const { overflowX, overflowY } = getComputedStyle(ancestor);
    const rect = ancestor.getBoundingClientRect();
    const clientTop = rect.top + ancestor.clientTop;
    const clientLeft = rect.left + ancestor.clientLeft;
    if (CLIPPING_OVERFLOW.includes(overflowY)) {
      top = Math.max(top, clientTop);
      bottom = Math.min(bottom, clientTop + ancestor.clientHeight);
    }
    if (CLIPPING_OVERFLOW.includes(overflowX)) {
      right = Math.min(right, clientLeft + ancestor.clientWidth);
    }
  }

  return { top, bottom, right };
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
  value?: T;
  onChange: (value: T) => void;
  searchPlaceholder?: string;
  triggerLabel?: string;
  triggerIcon?: IconNames;
  keepOpenFor?: T;
  onClose?: () => void;
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
  triggerIcon,
  keepOpenFor,
  onClose,
  children,
}: Props<T>) => {
  const { formatMessage } = useIntl();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState(false);
  const [openUp, setOpenUp] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const [maxHeight, setMaxHeight] = useState(MAX_HEIGHT);
  const [search, setSearch] = useState('');

  const close = () => {
    if (!opened) return;
    setOpened(false);
    setMaxHeight(MAX_HEIGHT);
    setSearch('');
    onClose?.();
  };

  useLayoutEffect(() => {
    if (!opened) return;

    const panel = contentRef.current?.offsetParent;
    const triggerElement = triggerRef.current;
    if (!(panel instanceof HTMLElement) || !triggerElement) return;

    const trigger = triggerElement.getBoundingClientRect();
    const bounds = getVisibleBounds(triggerElement);
    const spaceBelow = bounds.bottom - trigger.bottom - GAP;
    const spaceAbove = trigger.top - bounds.top - GAP;
    const fitsBelow = panel.offsetHeight <= spaceBelow;
    const fitsAbove = panel.offsetHeight <= spaceAbove;
    setOpenUp(!fitsBelow && (fitsAbove || spaceAbove > spaceBelow));
    if (!fitsBelow && !fitsAbove) {
      setMaxHeight(Math.max(spaceAbove, spaceBelow) - DROPDOWN_MARGIN);
    }
    setAlignRight(trigger.left + panel.offsetWidth > bounds.right - GAP);
  }, [opened]);

  const dismiss = () => {
    close();
    triggerRef.current?.focus();
  };

  const selected = options.find((option) => option.value === value);
  const icon = triggerIcon ?? selected?.icon;

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
          {icon && (
            <Icon
              name={icon}
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
        left={alignRight ? undefined : '0px'}
        right={alignRight ? '0px' : undefined}
        width="288px"
        maxHeight={`${maxHeight}px`}
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
