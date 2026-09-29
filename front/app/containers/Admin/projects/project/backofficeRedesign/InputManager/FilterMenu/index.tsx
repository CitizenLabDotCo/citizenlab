import React, { useState } from 'react';

import {
  Box,
  colors,
  DropdownListItem,
  Icon,
  Text,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import MenuButton from '../MenuButton';
import messages from '../messages';
import OptionList from '../OptionList';
import ToolbarIconButton from '../ToolbarIconButton';

import { FilterCategory, FilterCategoryKey } from './useFilterCategories';

interface Props {
  categories: FilterCategory[];
  onClearAll: () => void;
}

const FilterMenu = ({ categories, onClearAll }: Props) => {
  const { formatMessage } = useIntl();
  const [openCategoryKey, setOpenCategoryKey] =
    useState<FilterCategoryKey | null>(null);
  const openCategory = categories.find(
    (category) => category.key === openCategoryKey
  );
  const hasActiveFilters = categories.some((category) => category.isActive);

  return (
    <MenuButton
      align="right"
      width="280px"
      trigger={({ opened, toggle }) => (
        <ToolbarIconButton
          icon="filter"
          label={formatMessage(messages.filter)}
          active={opened}
          showDot={hasActiveFilters}
          onClick={() => {
            setOpenCategoryKey(null);
            toggle();
          }}
        />
      )}
    >
      {(close) =>
        openCategory ? (
          <Box>
            <DropdownListItem
              type="button"
              onClick={() => setOpenCategoryKey(null)}
            >
              <Box display="flex" alignItems="center" gap="8px">
                <Icon
                  name="chevron-left"
                  width="16px"
                  fill={colors.coolGrey600}
                />
                <Text as="span" m="0" fontSize="s" fontWeight="bold">
                  {openCategory.label}
                </Text>
              </Box>
            </DropdownListItem>
            <OptionList
              options={openCategory.options}
              selected={openCategory.selected}
              onToggle={openCategory.toggle}
              searchable={openCategory.searchable}
            />
          </Box>
        ) : (
          <Box>
            {categories.map((category) => (
              <DropdownListItem
                key={category.key}
                type="button"
                onClick={() => setOpenCategoryKey(category.key)}
              >
                <Box display="flex" alignItems="center" gap="8px" width="100%">
                  <Icon
                    name={category.icon}
                    width="16px"
                    fill={colors.coolGrey600}
                  />
                  <Box flexGrow={1}>
                    <Text m="0" fontSize="s" textAlign="left">
                      {category.label}
                    </Text>
                  </Box>
                  {category.isActive && category.multiple && (
                    <Text as="span" m="0" fontSize="xs" color="coolGrey600">
                      {category.selected.length}
                    </Text>
                  )}
                  <Icon
                    name="chevron-right"
                    width="16px"
                    fill={colors.coolGrey500}
                  />
                </Box>
              </DropdownListItem>
            ))}
            {hasActiveFilters && (
              <Box borderTop={`1px solid ${colors.divider}`} mt="4px" pt="4px">
                <DropdownListItem
                  type="button"
                  onClick={() => {
                    onClearAll();
                    close();
                  }}
                >
                  <Box display="flex" alignItems="center" gap="8px">
                    <Icon name="close" width="16px" fill={colors.red600} />
                    <Text as="span" m="0" fontSize="s" color="red600">
                      {formatMessage(messages.clearAllFilters)}
                    </Text>
                  </Box>
                </DropdownListItem>
              </Box>
            )}
          </Box>
        )
      }
    </MenuButton>
  );
};

export default FilterMenu;
