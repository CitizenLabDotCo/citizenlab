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
import MultiSelectDropdown from './MultiSelectDropdown';

const Container = styled(Box)<{ mr?: string; ml?: string }>`
  display: inline-block;
  position: relative;

  ${({ mr }) =>
    mr === undefined
      ? `
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
  `
      : `
    margin-right: ${mr};
  `}

  ${({ ml }) =>
    ml === undefined
      ? `
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
  `
      : `margin-left: ${ml};`}
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
  mr?: string;
  ml?: string;
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
  mr,
  ml,
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

  const sharedProps = {
    opened,
    selected,
    onClickOutside: handleClickOutside,
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
    filterSelectorStyle,
    minWidth,
    toggleValuesList,
    textColor,
    currentTitle: getTitle(selected, values, multipleSelectionAllowed, title),
    handleKeyDown,
  };

  return (
    <Container
      id={id}
      className={`e2e-filter-selector-${name} ${className} ${
        last ? 'last' : ''
      }`}
      mr={mr}
      ml={ml}
    >
      {multipleSelectionAllowed ? (
        <MultiSelectDropdown
          values={values}
          onChange={selectionChange}
          selectorId={selectorId}
          name={name}
          {...sharedProps}
        />
      ) : (
        <Combobox
          options={values}
          onChange={selectionChange}
          {...sharedProps}
        />
      )}
    </Container>
  );
};

export default FilterSelector;
