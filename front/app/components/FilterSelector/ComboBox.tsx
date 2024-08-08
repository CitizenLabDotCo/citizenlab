import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';

import {
  Dropdown,
  colors,
  fontSizes,
  isRtl,
  Box,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IFilterSelectorValue } from '.';

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const ListItemText = styled.span`
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 21px;
  text-align: left;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  ${isRtl`
    text-align: right;
  `}
`;

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

interface Props {
  options: IFilterSelectorValue[];
  width?: string;
  mobileWidth?: string;
  maxHeight?: string;
  mobileMaxHeight?: string;
  top?: string;
  left?: string;
  mobileLeft?: string;
  right?: string;
  mobileRight?: string;
  onChange: (arg: string) => void;
  opened: boolean;
  onClickOutside?: (event: React.FormEvent) => void;
  selected: any[];
  baseID: string;
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
}: Props) => {
  const listboxRef = useRef<HTMLUListElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (focusedIndex !== null && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll('li');
      if (items[focusedIndex]) {
        (items[focusedIndex] as HTMLElement).focus();
      }
    }
  }, [focusedIndex]);

  const handleKeyDown = (event: KeyboardEvent) => {
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
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {options.map((option, index) => (
              <ListItem
                key={index}
                id={`option-${index}`}
                role="option"
                aria-selected={selected.includes(option.value)}
                onClick={(event) => {
                  event.preventDefault();
                  onChange(option.value);
                }}
                tabIndex={-1}
              >
                <ListItemText id={`e2e-item-${option.value}`}>
                  {option.text}
                </ListItemText>
              </ListItem>
            ))}
          </List>
        }
      />
    </Box>
  );
};

export default Combobox;
