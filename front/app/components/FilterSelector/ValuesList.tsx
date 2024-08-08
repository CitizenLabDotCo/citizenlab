import React, { useRef, KeyboardEvent, FormEvent, useState } from 'react';

import {
  Dropdown,
  colors,
  fontSizes,
  isRtl,
  Box,
  Button,
  useBreakpoint,
  Icon,
} from '@citizenlab/cl2-component-library';
import { includes, isNil } from 'lodash-es';
import styled from 'styled-components';

import Checkbox from 'components/UI/Checkbox';

import { removeFocusAfterMouseClick } from 'utils/helperUtils';

import Title from './Title';

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

interface Value {
  text: string | JSX.Element;
  value: any;
}

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
  selectorId: string;
}

interface Props extends SelectorProps {
  values: Value[];
  name: string;
}

const ValuesList = ({
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
}: Props) => {
  const tabsRef = useRef({});
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const isPhoneOrSmaller = useBreakpoint('phone');

  const handleOnToggleCheckbox =
    (entry: Value) => (_event: React.ChangeEvent) => {
      onChange(entry.value);
    };

  const handleOnSelectSingleValue =
    (entry: Value) => (event: KeyboardEvent<HTMLLIElement>) => {
      if (
        event.type === 'keydown' &&
        (event.key === 'ArrowUp' || event.key === 'ArrowDown')
      ) {
        event.preventDefault();
        const totalItems = values.length;
        let nextIndex = 0;
        if (event.key === 'ArrowUp') {
          nextIndex = focusedIndex === 0 ? totalItems - 1 : focusedIndex - 1;
        } else {
          nextIndex = focusedIndex === totalItems - 1 ? 0 : focusedIndex + 1;
        }
        setFocusedIndex(nextIndex);
        tabsRef.current[nextIndex].focus();
      } else if (
        event.type === 'click' ||
        (event.type === 'keydown' && event.code === 'Space')
      ) {
        event.preventDefault();
        onChange(entry.value);
      }
    };

  const handleOnClickOutside = (event: FormEvent) => {
    onClickOutside?.(event);
  };

  return (
    <Box>
      <Box id={selectorId}>
        {/* The id is used for aria-labelledby on the group
         which defines the accessible name for the group */}
        {filterSelectorStyle === 'button' ? (
          <Button
            height={isPhoneOrSmaller ? '32px' : '36px'}
            borderRadius="24px"
            onClick={toggleValuesList}
            minWidth={minWidth}
            onKeyDown={handleKeyDown}
            ariaExpanded={opened}
            aria-controls={baseID}
            // Needed to track aria-labelledby
            id={`${baseID}-label`}
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
            multipleSelectionAllowed={true}
          />
        )}
      </Box>
      <Dropdown
        id={baseID} // Used for aria expanded and aria controls
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
          // The id is used for aria-labelledby on the group which defines
          // the accessible name for the group. The role group identifies the
          // group container for the list items.
          <Box role="group" aria-labelledby={selectorId}>
            <List className="e2e-sort-items">
              {values &&
                values.map((entry, index) => {
                  const checked = includes(selected, entry.value);
                  const last = index === values.length - 1;
                  const classNames = [
                    `e2e-sort-item-${
                      entry.value !== '-new' ? entry.value : 'old'
                    }`,
                    checked ? 'selected' : '',
                    last ? 'last' : '',
                  ]
                    .filter((item) => !isNil(item))
                    .join(' ');

                  return (
                    <CheckboxListItem
                      id={`${baseID}-${index}`}
                      key={entry.value}
                      onMouseDown={removeFocusAfterMouseClick}
                      onKeyDown={handleOnSelectSingleValue(entry)}
                      className={classNames}
                      ref={(el) => el && (tabsRef.current[index] = el)}
                    >
                      <Checkbox
                        checked={checked}
                        onChange={handleOnToggleCheckbox(entry)}
                        label={<CheckboxLabel>{entry.text}</CheckboxLabel>}
                        name={name}
                        selectedBorderColor={colors.white}
                      />
                    </CheckboxListItem>
                  );
                })}
            </List>
          </Box>
        }
      />
    </Box>
  );
};

export default ValuesList;

// TODO: page jump on landing page (doesn't happen on projects page)
