import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';

import {
  Dropdown,
  colors,
  Box,
  Button,
  Icon,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { SelectorProps } from './MultiSelectDropdown';
import { List, ListItemText } from './StyledComponents';
import Title from './Title';

import { IFilterSelectorValue } from '.';

const ListItem = styled.li`
  width: 100%;
  display: flex;
  align-items: center;
  margin: 0px;
  margin-bottom: 4px;
  padding: 10px;
  list-style: none;
  background: #fff;
  border-radius: ${(props) => props.theme.borderRadius};
  cursor: pointer;
  transition: all 80ms ease-out;

  &.last {
    margin-bottom: 0px;
  }

  &:hover,
  &:focus,
  &.selected {
    background: ${(props) => props.theme.colors.tenantSecondary};

    ${ListItemText} {
      color: ${colors.white};
    }
  }
`;

interface Props extends SelectorProps {
  options: IFilterSelectorValue[];
}

const Combobox = ({
  options,
  width,
  opened,
  selected,
  baseID,
  onChange,
  onClickOutside,
  mobileWidth,
  maxHeight,
  mobileMaxHeight,
  top,
  left,
  mobileLeft,
  right,
  mobileRight,
  filterSelectorStyle,
  minWidth,
  toggleValuesList,
  textColor,
  currentTitle,
  handleKeyDown,
}: Props) => {
  const listboxRef = useRef<HTMLUListElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const isPhoneOrSmaller = useBreakpoint('phone');

  useEffect(() => {
    if (focusedIndex !== null && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll('li');
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (items[focusedIndex]) {
        (items[focusedIndex] as HTMLElement).focus();
      }
    }
  }, [focusedIndex]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (listboxRef.current) {
      const items = listboxRef.current.querySelectorAll('li');
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex((prevIndex) =>
            prevIndex === null || prevIndex === items.length - 1
              ? 0
              : prevIndex + 1
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex((prevIndex) =>
            prevIndex === null || prevIndex === 0
              ? items.length - 1
              : prevIndex - 1
          );
          break;
        case 'Enter':
        case ' ':
          if (focusedIndex !== null) {
            event.preventDefault();
            const selectedItem = items[focusedIndex];
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (selectedItem) {
              selectedItem.click();
            }
          }
          break;
        default:
          break;
      }
    }
  };

  return (
    <Box>
      <Box>
        {/* The id is used for aria-labelledby on the group
         which defines the accessible name for the group */}
        {filterSelectorStyle === 'button' ? (
          <Button
            height={isPhoneOrSmaller ? '32px' : '36px'}
            borderRadius="24px"
            onClick={toggleValuesList}
            minWidth={minWidth ? minWidth : undefined}
            onKeyDown={handleKeyDown}
            ariaExpanded={opened}
            aria-controls={baseID}
            // Needed to track aria-labelledby
            id={`${baseID}-label`}
            role="combobox"
            aria-haspopup="listbox"
          >
            <Box display="flex" gap="8px">
              {currentTitle}
              <Icon
                fill={colors.white}
                name={opened ? 'chevron-up' : 'chevron-down'}
              />
            </Box>
          </Button>
        ) : (
          <Title
            key={baseID}
            title={currentTitle}
            opened={opened}
            onClick={toggleValuesList}
            baseID={baseID}
            textColor={textColor}
            handleKeyDown={handleKeyDown}
            role="combobox"
            aria-haspopup="listbox"
          />
        )}
      </Box>
      <Dropdown
        id={baseID}
        width={width}
        mobileWidth={mobileWidth}
        maxHeight={maxHeight}
        mobileMaxHeight={mobileMaxHeight}
        top={top}
        left={left}
        mobileLeft={mobileLeft}
        right={right}
        mobileRight={mobileRight}
        opened={opened}
        onClickOutside={onClickOutside}
        content={
          <List
            ref={listboxRef}
            role="listbox"
            aria-labelledby={`${baseID}-label`}
            aria-activedescendant={
              focusedIndex !== null ? `option-${focusedIndex}` : undefined
            }
            onKeyDown={onKeyDown}
            tabIndex={0}
          >
            {options.map((option, index) => (
              <ListItem
                key={index}
                id={`e2e-item-${option.value}`}
                role="option"
                aria-selected={selected.includes(option.value)}
                onClick={(event) => {
                  event.preventDefault();
                  onChange(option.value);
                }}
                tabIndex={-1}
              >
                <ListItemText>{option.text}</ListItemText>
              </ListItem>
            ))}
          </List>
        }
      />
    </Box>
  );
};

export default Combobox;
