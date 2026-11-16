import React from 'react';

import IconButton from 'design-system/IconButton';
import Menu, {
  MenuItem,
  MenuSeparator,
  MenuTrigger,
  SubmenuTrigger,
} from 'design-system/Menu';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import OptionList from '../OptionList';

import { FilterCategory } from './useFilterCategories';

interface Props {
  categories: FilterCategory[];
  onClearAll: () => void;
}

const FilterMenu = ({ categories, onClearAll }: Props) => {
  const { formatMessage } = useIntl();
  const hasActiveFilters = categories.some((category) => category.isActive);

  return (
    <MenuTrigger>
      <IconButton
        variant="bordered"
        icon="funnel-16"
        aria-label={formatMessage(messages.filter)}
        isSelected={hasActiveFilters}
      />
      <Menu aria-label={formatMessage(messages.filter)} placement="bottom end">
        {categories.map((category) => (
          <SubmenuTrigger key={category.key}>
            <MenuItem
              id={category.key}
              icon={category.icon}
              count={
                category.isActive && category.multiple
                  ? category.selected.length
                  : undefined
              }
            >
              {category.label}
            </MenuItem>
            <OptionList
              aria-label={category.label}
              options={category.options}
              selected={category.selected}
              onToggle={category.toggle}
              selectionMode={category.multiple ? 'multiple' : 'single'}
            />
          </SubmenuTrigger>
        ))}
        {hasActiveFilters && <MenuSeparator />}
        {hasActiveFilters && (
          <MenuItem
            id="clear"
            icon="x-16"
            variant="danger"
            onAction={onClearAll}
          >
            {formatMessage(messages.clearAllFilters)}
          </MenuItem>
        )}
      </Menu>
    </MenuTrigger>
  );
};

export default FilterMenu;
