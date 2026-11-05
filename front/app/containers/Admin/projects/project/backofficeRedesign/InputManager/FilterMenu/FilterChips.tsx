import React from 'react';

import {
  bo,
  Box,
  Button,
  colors,
  Icon,
  IconButton,
  Text,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import { FilterCategory } from './useFilterCategories';

interface Props {
  categories: FilterCategory[];
  onClearAll: () => void;
}

const FilterChips = ({ categories, onClearAll }: Props) => {
  const { formatMessage } = useIntl();
  const activeCategories = categories.filter((category) => category.isActive);

  if (activeCategories.length === 0) return null;

  return (
    <Box
      display="flex"
      alignItems="center"
      gap="8px"
      flexWrap="wrap"
      p="8px"
      mb="8px"
      background={colors.grey50}
      borderRadius={bo.borderRadius}
    >
      {activeCategories.map((category) => {
        const values = category.options
          .filter((option) => category.selected.includes(option.value))
          .map((option) => option.label)
          .join(', ');

        return (
          <Box
            key={category.key}
            display="flex"
            alignItems="center"
            gap="6px"
            pl="8px"
            background={colors.white}
            border={`1px solid ${colors.grey300}`}
            borderRadius={bo.borderRadius}
          >
            <Icon name={category.icon} width="14px" fill={colors.coolGrey600} />
            <Text variant="boLabel" as="span" m="0">
              {category.label}
            </Text>
            <Text variant="boHelper" as="span" m="0">
              {formatMessage(
                category.multiple ? messages.isAnyOf : messages.is
              )}
            </Text>
            <Text variant="boSection" as="span" m="0">
              {values}
            </Text>
            <IconButton
              iconName="close"
              iconWidth="14px"
              iconHeight="14px"
              iconColor={colors.coolGrey600}
              iconColorOnHover={colors.textPrimary}
              a11y_buttonActionMessage={formatMessage(messages.removeFilter)}
              onClick={category.clear}
            />
          </Box>
        );
      })}
      <Box ml="auto">
        <Button buttonStyle="bo-text" onClick={onClearAll}>
          {formatMessage(messages.clearFilters)}
        </Button>
      </Box>
    </Box>
  );
};

export default FilterChips;
