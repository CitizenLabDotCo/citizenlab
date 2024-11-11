import React from 'react';

import { Box, Text, Icon, colors } from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

import { FrontOfficeSort } from 'api/ideas/types';

import { useIntl } from 'utils/cl-intl';

import {
  getButtonBackgroundColor,
  getIconNameForSortingOption,
  getLabelForSortingOption,
} from './utils';

type SortTypeButtonProps = {
  sortType: FrontOfficeSort;
  handleSortOnChange: (sort: string) => void;
  isSelected: boolean;
};

const StyledBox = styled(Box)`
  display: flex;
  padding-top: 8px;
  padding-bottom: 8px;
  width: 100% !important;
  justify-content: left;
  border-radius: 3px;
  cursor: pointer;
`;

const SortTypeButton = ({
  sortType,
  handleSortOnChange,
  isSelected,
}: SortTypeButtonProps) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();
  const [isHover, setIsHover] = React.useState(false);

  return (
    <StyledBox
      as="button"
      onClick={() => handleSortOnChange(sortType)}
      onMouseEnter={() => {
        setIsHover(true);
      }}
      onMouseLeave={() => {
        setIsHover(false);
      }}
      bgColor={getButtonBackgroundColor(isSelected, isHover, theme)}
    >
      <Icon
        fill={isSelected ? colors.white : theme.colors.textPrimary}
        height="14px"
        name={getIconNameForSortingOption(sortType)}
        my="auto"
      />
      <Text color={isSelected ? 'white' : 'textPrimary'} m="0px">
        {formatMessage(getLabelForSortingOption(sortType))}
      </Text>
    </StyledBox>
  );
};

export default SortTypeButton;
