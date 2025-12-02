import React, { useRef, KeyboardEvent, FormEvent } from 'react';

import {
  Dropdown,
  colors,
  fontSizes,
  Box,
  Button,
  useBreakpoint,
  Icon,
  Spinner,
} from '@citizenlab/cl2-component-library';
import { includes, isNil } from 'lodash-es';
import styled from 'styled-components';

import Checkbox from 'components/UI/Checkbox';

import { removeFocusAfterMouseClick } from 'utils/helperUtils';

import { List, ListItemText } from './StyledComponents';
import Title from './Title';

import { IFilterSelectorValue } from '.';

const CheckboxLabel = styled.span`
  flex: 1;
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: 21px;
  text-align: left;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  display: block;
  padding: 10px 0;
`;

const CheckboxListItem = styled.li`
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
  padding: 0 10px;

  &.last {
    margin-bottom: 0px;
  }

  &:hover,
  &:focus,
  &.selected {
    background: ${(props) => props.theme.colors.tenantSecondary};

    ${ListItemText}, ${CheckboxLabel} {
      color: ${colors.white};
    }
  }
`;

export interface SelectorProps {
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
  filterSelectorStyle?: 'button' | 'text';
  minWidth?: string;
  toggleValuesList: () => void;
  textColor?: string;
  currentTitle: string | JSX.Element;
  handleKeyDown?: (event: KeyboardEvent) => void;
  isLoading?: boolean;
}

interface Props extends SelectorProps {
  values: IFilterSelectorValue[];
  name: string;
  selectorId: string;
}

const MultiSelectDropdown = ({
  values,
  selected,
  opened,
  baseID,
  width,
  mobileWidth,
  maxHeight,
  mobileMaxHeight,
  top,
  left,
  mobileLeft,
  right,
  mobileRight,
  name,
  onChange,
  onClickOutside,
  selectorId,
  filterSelectorStyle,
  minWidth,
  toggleValuesList,
  textColor,
  currentTitle,
  handleKeyDown,
  isLoading,
}: Props) => {
  const tabsRef = useRef<(HTMLLIElement | null)[]>([]);
  const isPhoneOrSmaller = useBreakpoint('phone');

  const handleOnToggleCheckbox =
    (entry: IFilterSelectorValue) => (_event: React.ChangeEvent) => {
      onChange(entry.value);
    };

  const handleOnKeyDown = (event: KeyboardEvent) => {
    const target = event.currentTarget as HTMLElement;
    const value = target.getAttribute('data-value');
    const index = parseInt(target.getAttribute('data-index')!, 10);
    const key = event.key;
    const totalItems = values.length;

    switch (key) {
      case 'ArrowDown':
        if (!opened) {
          handleKeyDown?.(event);
          return;
        }
        event.preventDefault();
        // navigate to next item (circular 0,1,2,3,...,0)
        tabsRef.current[(index + 1) % totalItems]?.focus();
        break;

      case 'ArrowUp':
        event.preventDefault();
        // navigate to previous item (circular ...,3,2,1,0,4)
        tabsRef.current[(index - 1 + totalItems) % totalItems]?.focus();
        break;

      case 'Enter':
      case ' ':
        if (value) {
          event.preventDefault();
          onChange(value);
        }
        break;

      case 'Tab':
        if (opened) {
          toggleValuesList();
        }
        break;
    }
  };

  const handleOnClickOutside = (event: FormEvent) => {
    onClickOutside?.(event);
  };

  return (
    <Box>
      <Box id={selectorId}>
        {filterSelectorStyle === 'button' ? (
          <Button
            height={isPhoneOrSmaller ? '32px' : '36px'}
            borderRadius="24px"
            onClick={toggleValuesList}
            minWidth={minWidth}
            onKeyDown={handleOnKeyDown}
            ariaExpanded={opened}
            ariaControls={baseID}
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
            handleKeyDown={handleOnKeyDown}
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
        onClickOutside={handleOnClickOutside}
        content={
          <Box role="group" aria-labelledby={selectorId}>
            <List className="e2e-sort-items">
              {values.map((entry, index) => {
                const checked = includes(selected, entry.value);
                const last = index === values.length - 1;
                const classNames = [
                  `e2e-sort-item-${
                    entry.value !== '-new' ? entry.value : 'old'
                  }`,
                  last ? 'last' : '',
                ]
                  .filter((item) => !isNil(item))
                  .join(' ');

                return (
                  <CheckboxListItem
                    id={`${baseID}-${index}`}
                    key={entry.value}
                    onMouseDown={removeFocusAfterMouseClick}
                    onKeyDown={handleOnKeyDown}
                    className={classNames}
                    ref={(el) => (tabsRef.current[index] = el)}
                    role="checkbox"
                    aria-checked={checked}
                    data-value={entry.value}
                    data-index={index}
                    tabIndex={0}
                  >
                    <Checkbox
                      checked={checked}
                      onChange={handleOnToggleCheckbox(entry)}
                      label={<CheckboxLabel>{entry.text}</CheckboxLabel>}
                      name={name}
                      selectedBorderColor={colors.white}
                      checkBoxTabIndex={-1}
                    />
                  </CheckboxListItem>
                );
              })}
            </List>
            {isLoading && <Spinner />}
          </Box>
        }
      />
    </Box>
  );
};

export default MultiSelectDropdown;
