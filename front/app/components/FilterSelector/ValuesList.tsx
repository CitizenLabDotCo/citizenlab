import React, { useRef, useEffect, KeyboardEvent, FormEvent } from 'react';

import {
  Dropdown,
  colors,
  fontSizes,
  isRtl,
  Box,
} from '@citizenlab/cl2-component-library';
import { includes, isNil } from 'lodash-es';
import styled from 'styled-components';

import Checkbox from 'components/UI/Checkbox';

import { removeFocusAfterMouseClick } from 'utils/helperUtils';

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

interface DefaultProps {
  width?: string;
  mobileWidth?: string;
  maxHeight?: string;
  mobileMaxHeight?: string;
  top?: string;
  left?: string;
  mobileLeft?: string;
  right?: string;
  mobileRight?: string;
}

interface Props extends DefaultProps {
  title: string | JSX.Element;
  values: Value[];
  onChange: (arg: string) => void;
  onClickOutside?: (event: React.FormEvent) => void;
  selected: any[];
  right?: string;
  mobileRight?: string;
  multipleSelectionAllowed?: boolean;
  opened: boolean;
  baseID: string;
  name: string;
}

const ValuesList = ({
  values,
  selected,
  multipleSelectionAllowed,
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
}: Props) => {
  const tabsRef = useRef({});
  const [focusedIndex, setFocusedIndex] = React.useState(0);

  const handleOnToggleCheckbox =
    (entry: Value) => (_event: React.ChangeEvent) => {
      onChange(entry.value);
    };

  useEffect(() => {
    if (opened && Object.keys(tabsRef.current).length > 0) {
      tabsRef.current[0].focus();
    }
  }, [opened]);

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
        <Box role="group" aria-labelledby={`id-${name}`}>
          <List
            className="e2e-sort-items"
            aria-multiselectable={multipleSelectionAllowed}
          >
            {values &&
              values.map((entry, index) => {
                const checked = includes(selected, entry.value);
                const last = index === values.length - 1;
                const classNames = [
                  `e2e-sort-item-${
                    entry.value !== '-new' ? entry.value : 'old'
                  }`,
                  !multipleSelectionAllowed && checked ? 'selected' : '',
                  last ? 'last' : '',
                ]
                  .filter((item) => !isNil(item))
                  .join(' ');

                return multipleSelectionAllowed ? (
                  <CheckboxListItem
                    id={`${baseID}-${index}`}
                    role="option"
                    aria-posinset={index + 1}
                    aria-selected={checked}
                    key={entry.value}
                    onMouseDown={removeFocusAfterMouseClick}
                    onKeyDown={handleOnSelectSingleValue(entry)}
                    className={classNames}
                    tabIndex={-1}
                    ref={(el) => el && (tabsRef.current[index] = el)}
                  >
                    <Checkbox
                      checked={checked}
                      onChange={handleOnToggleCheckbox(entry)}
                      label={<CheckboxLabel>{entry.text}</CheckboxLabel>}
                      name={name}
                      checkBoxTabIndex={-1}
                      selectedBorderColor={colors.white}
                    />
                  </CheckboxListItem>
                ) : (
                  <ListItem
                    id={`${baseID}-${index}`}
                    role="option"
                    aria-posinset={index + 1}
                    aria-selected={checked}
                    key={entry.value}
                    onMouseDown={removeFocusAfterMouseClick}
                    className={classNames}
                    onClick={(event) => {
                      event.preventDefault();

                      onChange(entry.value);
                    }}
                    onKeyDown={handleOnSelectSingleValue(entry)}
                    tabIndex={-1}
                    ref={(el) => el && (tabsRef.current[index] = el)}
                  >
                    <ListItemText id={`e2e-item-${entry.value}`}>
                      {entry.text}
                    </ListItemText>
                  </ListItem>
                );
              })}
          </List>
        </Box>
      }
    />
  );
};

export default ValuesList;

// TODO: page jump on landing page (doesn't happen on projects page)
