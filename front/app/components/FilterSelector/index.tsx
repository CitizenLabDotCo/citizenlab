import React, { useState, KeyboardEvent, useMemo } from 'react';

import { Box, media, isRtl } from '@citizenlab/cl2-component-library';
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

import Combobox from './Combobox';
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

  // We use a random id for the selectorId to ensure it doesn't conflict if multiple
  // instances of the same filter selector are rendered on the same page.
  const selectorId = useMemo(
    () => `id-${name}-${Math.random().toString(36).slice(2, 11)}`,
    [name]
  );

  return (
    <Container
      id={id}
      className={`e2e-filter-selector-${name} ${className} ${
        last ? 'last' : ''
      }`}
    >
      {multipleSelectionAllowed ? (
        <ValuesList
          opened={opened}
          values={values}
          selected={selected}
          onChange={selectionChange}
          onClickOutside={handleClickOutside}
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
          selectorId={selectorId}
          filterSelectorStyle={filterSelectorStyle}
          minWidth={minWidth}
          toggleValuesList={toggleValuesList}
          textColor={textColor}
          currentTitle={currentTitle}
          handleKeyDown={handleKeyDown}
        />
      ) : (
        <Combobox
          options={values}
          width={width}
          onChange={selectionChange}
          opened={opened}
          onClickOutside={handleClickOutside}
          selected={selected}
          baseID={baseID}
          mobileWidth={mobileWidth}
          maxHeight={maxHeight}
          mobileMaxHeight={mobileMaxHeight}
          top={top}
          left={left}
          mobileLeft={mobileLeft}
          right={right}
          mobileRight={mobileRight}
          filterSelectorStyle={filterSelectorStyle}
          minWidth={minWidth}
          toggleValuesList={toggleValuesList}
          textColor={textColor}
          currentTitle={currentTitle}
          handleKeyDown={handleKeyDown}
          selectorId={selectorId}
        />
      )}
    </Container>
  );
};

export default FilterSelector;
