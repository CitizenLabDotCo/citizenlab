import React, { useState, KeyboardEvent } from 'react';

import {
  Box,
  Button,
  Icon,
  colors,
  useBreakpoint,
  media,
  isRtl,
} from '@citizenlab/cl2-component-library';
import {
  isArray,
  find,
  isEmpty,
  isString,
  cloneDeep,
  includes,
  without,
} from 'lodash-es';
import styled from 'styled-components';

import Title from './Title';
import ValuesList from './ValuesList';

const Container = styled(Box)`
  display: inline-block;
  position: relative;

  &:not(:last-child) {
    margin-right: 40px;

    ${media.tablet`
      margin-right: 30px;
    `}

    ${media.phone`
      margin-right: 25px;
    `}

    ${media.phone`
      margin-right: 20px;
    `}
  }

  &.last {
    margin-right: 0px;
  }

  ${isRtl`
    &:not(:last-child) {
      margin-left: 40px;

      ${media.tablet`
        margin-left: 30px;
      `}

      ${media.phone`
        margin-left: 20px;
      `}
    }

    &.last {
      margin-left: 0px;
    }
  `}
`;

export interface IFilterSelectorValue {
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
  last?: boolean;
  textColor?: string;
}

interface Props extends DefaultProps {
  id?: string | undefined;
  title: string | JSX.Element;
  name: string;
  values: IFilterSelectorValue[];
  onChange?: (values: string[]) => void;
  multipleSelectionAllowed: boolean;
  selected: string[];
  className?: string;
  filterSelectorStyle?: 'button' | 'text';
  minWidth?: string;
}

const FilterSelector = ({
  width,
  onChange,
  multipleSelectionAllowed,
  selected,
  mobileWidth,
  maxHeight,
  mobileMaxHeight,
  top,
  left,
  mobileLeft,
  minWidth,
  right,
  mobileRight,
  name,
  title,
  values,
  id,
  className,
  textColor,
  last,
  filterSelectorStyle = 'text',
}: Props) => {
  const baseID = `filter-${Math.floor(Math.random() * 10000000)}`;
  const [opened, setOpened] = useState(false);
  const isPhoneOrSmaller = useBreakpoint('phone');

  const getTitle = (
    selection: string[],
    values: IFilterSelectorValue[],
    multipleSelectionAllowed: boolean,
    title: string | JSX.Element
  ) => {
    let newTitle: any = '';

    if (
      !multipleSelectionAllowed &&
      isArray(selection) &&
      !isEmpty(selection)
    ) {
      const selected = find(values, { value: selection[0] });
      newTitle = selected ? selected['text'] : '';
    } else if (isArray(selection) && !isEmpty(selection)) {
      if (isString(title)) {
        newTitle = `${title} (${selection.length})`;
      } else {
        newTitle = (
          <>
            {title} ({selection.length})
          </>
        );
      }
    } else {
      newTitle = title;
    }

    return newTitle;
  };

  const toggleValuesList = () => {
    setOpened((current) => !current);
  };

  const closeExpanded = () => {
    setOpened(false);
  };

  const selectionChange = (value: string) => {
    let newSelection = cloneDeep(selected);

    if (!multipleSelectionAllowed) {
      newSelection = [value];
    } else if (includes(newSelection, value)) {
      newSelection = without(newSelection, value);
    } else {
      newSelection.push(value);
    }

    if (onChange) {
      onChange(newSelection);
    }

    if (!multipleSelectionAllowed) {
      closeExpanded();
    }
  };

  const handleClickOutside = () => {
    closeExpanded();
  };

  const currentTitle = getTitle(
    selected,
    values,
    multipleSelectionAllowed,
    title
  );

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' && !opened) {
      event.preventDefault();
      toggleValuesList();
    }
  };

  return (
    <Container
      id={id}
      className={`e2e-filter-selector-${name} ${className} ${
        last ? 'last' : ''
      }`}
    >
      <Box id={`id-${name}`}>
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
          />
        )}
      </Box>
      <ValuesList
        title={currentTitle}
        opened={opened}
        values={values}
        selected={selected}
        onChange={selectionChange}
        onClickOutside={handleClickOutside}
        multipleSelectionAllowed={multipleSelectionAllowed}
        baseID={baseID}
        width={width}
        mobileWidth={mobileWidth}
        maxHeight={maxHeight}
        mobileMaxHeight={mobileMaxHeight}
        top={top}
        left={left}
        mobileLeft={mobileLeft}
        right={right}
        mobileRight={mobileRight}
        name={name}
      />
    </Container>
  );
};

export default FilterSelector;
