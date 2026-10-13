import React, { ReactNode, useState } from 'react';

import {
  Box,
  Checkbox,
  DropdownListItem,
  Input,
  Text,
  Tooltip,
} from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

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

interface Props {
  options: Option[];
  selected: string[];
  onToggle: (value: string) => void;
  searchable?: boolean;
}

const OptionList = ({
  options,
  selected,
  onToggle,
  searchable = options.length >= SEARCHABLE_FROM,
}: Props) => {
  const { formatMessage } = useIntl();
  const [search, setSearch] = useState('');

  const visibleOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.trim().toLowerCase())
  );

  return (
    <Box display="flex" flexDirection="column">
      {searchable && (
        <Box mb="4px">
          <Input
            type="text"
            size="small"
            value={search}
            onChange={setSearch}
            placeholder={formatMessage(messages.searchOptions)}
            ariaLabel={formatMessage(messages.searchOptions)}
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
              <Box display="flex" alignItems="center" gap="8px" width="100%">
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
                    flex="0 0 8px"
                    width="8px"
                    height="8px"
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
        <Text variant="boHelper" m="8px">
          {formatMessage(messages.noMatchingOptions)}
        </Text>
      )}
    </Box>
  );
};

export default OptionList;
