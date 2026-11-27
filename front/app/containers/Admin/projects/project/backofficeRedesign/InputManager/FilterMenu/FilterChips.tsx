import React from 'react';

import FilterBar, { FilterChip } from 'design-system/FilterBar';
import Menu, { MenuItem, SubmenuTrigger } from 'design-system/Menu';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import OptionList from '../OptionList';

import { FilterCategory } from './useFilterCategories';
import 'design-system/tokens.css';

interface Props {
  categories: FilterCategory[];
  /** The formatted result count, e.g. "24 inputs". */
  count?: string;
  onClearAll: () => void;
}

const FilterChips = ({ categories, count, onClearAll }: Props) => {
  const { formatMessage } = useIntl();
  const activeCategories = categories.filter((category) => category.isActive);
  const inactiveCategories = categories.filter(
    (category) => !category.isActive
  );

  if (activeCategories.length === 0) return null;

  return (
    <FilterBar
      count={count}
      onClear={onClearAll}
      addFilterMenu={
        <Menu aria-label={formatMessage(messages.filter)}>
          {inactiveCategories.map((category) => (
            <SubmenuTrigger key={category.key}>
              <MenuItem id={category.key} icon={category.icon}>
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
        </Menu>
      }
    >
      {activeCategories.map((category) => {
        const values = category.options
          .filter((option) => category.selected.includes(option.value))
          .map((option) => option.label)
          .join(', ');

        return (
          <FilterChip
            key={category.key}
            label={`${category.label} ${formatMessage(
              category.multiple ? messages.isAnyOf : messages.is
            )} ${values}`}
            menu={
              <OptionList
                aria-label={category.label}
                options={category.options}
                selected={category.selected}
                onToggle={category.toggle}
                selectionMode={category.multiple ? 'multiple' : 'single'}
              />
            }
            onRemove={category.clear}
          />
        );
      })}
    </FilterBar>
  );
};

export default FilterChips;
