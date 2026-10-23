import React, { ReactNode, useState } from 'react';

import { gvTag } from '../../utils/gvTag';
import Box from '../Box';
import Checkbox from '../Checkbox';
import { DropdownListItem } from '../Dropdown';
import Input from '../Input';
import Text from '../Text';
import Tooltip from '../Tooltip';

export interface Option {
  value: string;
  label: string;
  color?: string;
  count?: number;
  disabled?: boolean;
  disabledReason?: ReactNode;
  partial?: boolean;
}

const SEARCHABLE_FROM = 9;

export interface Props {
  options: Option[];
  selected: string[];
  onToggle: (value: string) => void;
  searchable?: boolean;
  /** Placeholder and label of the search field. */
  searchPlaceholder: string;
  /** Shown when the search matches no option. */
  noMatchesText: string;
}

/**
 * A list of checkable options, for a dropdown menu: optional colour dot
 * and count per option, a search field from nine options on.
 */
const OptionList = ({
  options,
  selected,
  onToggle,
  searchable = options.length >= SEARCHABLE_FROM,
  searchPlaceholder,
  noMatchesText,
}: Props) => {
  const [search, setSearch] = useState('');

  const visibleOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <Box {...gvTag('OptionList')} display="flex" flexDirection="column">
      {searchable && (
        <Box mb="var(--gv-space-1)">
          <Input
            type="text"
            size="small"
            value={search}
            onChange={setSearch}
            placeholder={searchPlaceholder}
            ariaLabel={searchPlaceholder}
          />
        </Box>
      )}
      {visibleOptions.map((option) => {
        const isSelected = selected.includes(option.value);

        return (
          <Tooltip
            key={option.value}
            content={option.disabledReason}
            disabled={!option.disabled || !option.disabledReason}
            placement="left"
            theme="dark"
          >
            <DropdownListItem
              type="button"
              role="menuitemcheckbox"
              aria-checked={isSelected}
              disabled={option.disabled}
              onClick={() => onToggle(option.value)}
            >
              <Box
                display="flex"
                alignItems="center"
                gap="var(--gv-space-2)"
                width="100%"
              >
                <Box
                  display="flex"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Checkbox
                    size="18px"
                    checked={isSelected}
                    indeterminate={!isSelected && option.partial}
                    disabled={option.disabled}
                    onChange={() => onToggle(option.value)}
                    tabIndex={-1}
                  />
                </Box>
                {option.color && (
                  <Box
                    flex="0 0 var(--gv-space-2)"
                    width="var(--gv-space-2)"
                    height="var(--gv-space-2)"
                    borderRadius="50%"
                    background={option.color}
                  />
                )}
                <Box flexGrow={1}>
                  <Text
                    variant="boLabel"
                    m="0"
                    color={option.disabled ? 'coolGrey500' : 'textPrimary'}
                    textAlign="left"
                  >
                    {option.label}
                  </Text>
                </Box>
                {option.count !== undefined && (
                  <Text variant="boMicro" color="coolGrey500" as="span" m="0">
                    {option.count}
                  </Text>
                )}
              </Box>
            </DropdownListItem>
          </Tooltip>
        );
      })}
      {visibleOptions.length === 0 && (
        <Text variant="boHelper" m="var(--gv-space-2)">
          {noMatchesText}
        </Text>
      )}
    </Box>
  );
};

export default OptionList;
