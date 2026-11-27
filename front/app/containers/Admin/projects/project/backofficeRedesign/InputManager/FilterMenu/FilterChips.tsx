import React from 'react';

import FilterBar, { FilterChip } from 'design-system/FilterBar';
import Menu, { MenuItem, SubmenuTrigger } from 'design-system/Menu';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import OptionList from '../OptionList';

import styles from './FilterChips.module.css';
import { FilterCategory, FilterCategoryKey } from './useFilterCategories';
import 'design-system/tokens.css';

interface Props {
  categories: FilterCategory[];
  /** The formatted result count, e.g. "24 inputs". */
  count?: string;
  /** Set when the list is filtered by exactly one of the stats. */
  preset?: { label: string; onRemove: () => void };
  onClearAll: () => void;
}

// The filters a stat sets; its chip stands in for theirs.
const PRESET_KEYS: FilterCategoryKey[] = [
  'status',
  'assignee',
  'reply',
  'contentWarnings',
];

const FilterChips = ({ categories, count, preset, onClearAll }: Props) => {
  const { formatMessage } = useIntl();
  const activeCategories = categories.filter((category) => category.isActive);
  const chipCategories = preset
    ? activeCategories.filter((category) => !PRESET_KEYS.includes(category.key))
    : activeCategories;
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
      {preset && (
        <FilterChip label={preset.label} onRemove={preset.onRemove} />
      )}
      {chipCategories.map((category) => {
        const values = category.options
          .filter((option) => category.selected.includes(option.value))
          .map((option) => option.label)
          .join(', ');

        return (
          <FilterChip
            key={category.key}
            label={
              <span className={styles.label}>
                {category.label}{' '}
                <span className={styles.connector}>
                  {formatMessage(
                    category.multiple ? messages.isAnyOf : messages.is
                  )}
                </span>{' '}
                {values}
              </span>
            }
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
