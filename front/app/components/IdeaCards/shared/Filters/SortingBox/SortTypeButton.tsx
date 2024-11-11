import React from 'react';

import { Box, Text, Icon, colors } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import { FrontOfficeSortOptions } from 'api/ideas/types';

import { useIntl } from 'utils/cl-intl';

import {
  getButtonBackgroundColor,
  getIconNameForSortingOption,
  getLabelForSortingOption,
} from './utils';

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
  const [isHover, setIsHover] = React.useState(false);

  return (
    <Box
      as="button"
      display="flex"
      py="8px"
      w="100%"
      justifyContent="flex-start"
      borderRadius="3px"
      onClick={() => handleSortOnChange(sortType)}
      onMouseEnter={() => {
        setIsHover(true);
      }}
      onMouseLeave={() => {
        setIsHover(false);
      }}
      bgColor={getButtonBackgroundColor(isSelected, isHover, theme)}
      style={{ cursor: 'pointer' }}
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
    </Box>
  );
};

export default SortTypeButton;
