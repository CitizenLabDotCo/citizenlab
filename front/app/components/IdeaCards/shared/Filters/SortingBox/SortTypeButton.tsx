import React from 'react';

import { Box, colors, Icon } from '@citizenlab/cl2-component-library';
import { hideVisually, darken } from 'polished';
import styled, { useTheme } from 'styled-components';

import { FrontOfficeSortOptions } from 'api/ideas/types';

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
`;

type SortTypeButtonProps = {
  sortType: FrontOfficeSortOptions;
  handleSortOnChange: (sort: string) => void;
  isSelected: boolean;
};

const SortTypeButton = ({
  sortType,
  handleSortOnChange,
  isSelected,
}: SortTypeButtonProps) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();

  const handleOnChange = () => {
    handleSortOnChange(sortType);
  };

  return (
    // <Button
    //   py="8px"
    //   bgColor={getButtonBackgroundColor(isSelected, isHover, theme)}
    //   icon={getIconNameForSortingOption(sortType)}
    //   iconColor={isSelected ? 'white' : 'textPrimary'}
    //   iconHoverColor={isSelected ? 'white' : 'textPrimary'}
    //   textColor={isSelected ? 'white' : 'textPrimary'}
    //   textHoverColor="textPrimary"
    //   type="button"
    // >
    // </Button>
    <Box display="flex" alignItems="center">
      <HiddenRadio
        id={sortType}
        name="sortType"
        value={sortType}
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
