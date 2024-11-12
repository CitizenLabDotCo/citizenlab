import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { hideVisually } from 'polished';
import styled from 'styled-components';

import { FrontOfficeSortOptions } from 'api/ideas/types';

import { useIntl } from 'utils/cl-intl';

import { getLabelForSortingOption } from './utils';

const HiddenRadio = styled.input.attrs({ type: 'radio' })`
  // ${hideVisually()};
  display: block;
`;

const Label = styled.label<{ selected: boolean }>`
  padding: 8px;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius};

  ${({ theme: { colors }, selected }) =>
    selected
      ? `
    background: ${colors.tenantPrimary};
    color: ${colors.white};
  `
      : `
    background: ${colors.white};
    color: ${colors.textPrimary};
  `}
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
    //   {formatMessage(getLabelForSortingOption(sortType))}
    //   {/* <Box>
    //     <Icon
    //       fill={isSelected ? colors.white : theme.colors.textPrimary}
    //       height="14px"
    //       name={getIconNameForSortingOption(sortType)}
    //       my="auto"
    //     />
    //   </Box> */}
    // </Button>
    <Box display="flex" alignItems="center">
      <HiddenRadio
        id={sortType}
        name="sortType"
        value={sortType}
        onChange={handleOnChange}
      />
      <Label htmlFor={sortType} onClick={handleOnChange} selected={isSelected}>
        {formatMessage(getLabelForSortingOption(sortType))}
      </Label>
    </Box>
  );
};

export default SortTypeButton;
