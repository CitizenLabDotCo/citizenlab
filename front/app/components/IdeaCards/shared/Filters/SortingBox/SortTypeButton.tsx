import React from 'react';

import { Box, BoxProps, colors, Icon } from '@citizenlab/cl2-component-library';
import { hideVisually, darken } from 'polished';
import styled, { useTheme } from 'styled-components';

import { IdeaDefaultSortMethod } from 'api/phases/types';

import { useIntl } from 'utils/cl-intl';

import { getIconNameForSortingOption, getLabelForSortingOption } from './utils';

const HiddenRadio = styled.input.attrs({ type: 'radio' })`
  ${hideVisually()};
`;

const Label = styled.label<{ selected: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius};
  width: 100%;
  font-size: ${({ theme }) => theme.fontSizes.base}px;

  ${({ theme: { colors }, selected }) =>
    selected
      ? `
    background: ${colors.tenantPrimary};
    color: ${colors.white};
    
    &:hover {
      background: ${darken(0.15, colors.tenantPrimary)};
    } `
      : `
    background: ${colors.white};
    color: ${colors.textPrimary};
    
    &:hover {
      background: rgba(132, 147, 158, 0.15);
    }`}

  ${HiddenRadio}.focus-visible + & {
    outline: 2px solid black;
  }
`;

type SortTypeButtonProps = {
  sortType: IdeaDefaultSortMethod;
  handleSortOnChange: (sort: string) => void;
  isSelected: boolean;
};

const SortTypeButton = ({
  sortType,
  handleSortOnChange,
  isSelected,
  ...boxProps
}: SortTypeButtonProps & BoxProps) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();

  const handleOnChange = () => {
    handleSortOnChange(sortType);
  };

  return (
    <Box display="flex" alignItems="center" {...boxProps}>
      <HiddenRadio
        id={sortType}
        name="sortType"
        value={sortType}
        checked={isSelected}
        onChange={handleOnChange}
      />
      <Label htmlFor={sortType} onClick={handleOnChange} selected={isSelected}>
        <Icon
          fill={isSelected ? colors.white : theme.colors.textPrimary}
          height="14px"
          name={getIconNameForSortingOption(sortType)}
          mr="4px"
          ariaHidden
        />
        {formatMessage(getLabelForSortingOption(sortType))}
      </Label>
    </Box>
  );
};

export default SortTypeButton;
