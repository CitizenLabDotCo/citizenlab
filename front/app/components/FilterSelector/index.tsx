import React, { useState } from 'react';
import {
  isArray,
  find,
  isEmpty,
  isString,
  cloneDeep,
  includes,
  without,
} from 'lodash-es';

// components
import Title from './title';
import ValuesList from './valuesList';
import { Box, Button, Icon, colors } from '@citizenlab/cl2-component-library';

// style
import styled from 'styled-components';
import { media, isRtl } from 'utils/styleUtils';

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

  const toggleExpanded = () => {
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

  return (
    <Container
      id={id}
      className={`e2e-filter-selector-${name} ${className} ${
        last ? 'last' : ''
      }`}
    >
      {filterSelectorStyle === 'button' ? (
        <Button height="38px" borderRadius="24px" onClick={toggleExpanded}>
          <Box display="flex" gap="8px">
            {currentTitle}
            <Icon fill={colors.white} name={'chevron-down'} />
          </Box>
        </Button>
      ) : (
        <Title
          key={baseID}
          title={currentTitle}
          opened={opened}
          onClick={toggleExpanded}
          baseID={baseID}
          textColor={textColor}
        />
      )}
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
