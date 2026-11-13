import React, { ReactNode, useState } from 'react';

import {
  Box,
  Checkbox,
  colors,
  DropdownListItem,
  Icon,
  IconNames,
  Input,
  Text,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const OptionRow = styled(DropdownListItem)`
  height: 32px;
  padding: 0 8px;
  margin-bottom: 0;
`;

const CheckSlot = styled.span<{ revealOnHover: boolean }>`
  display: flex;
  opacity: ${({ revealOnHover }) => (revealOnHover ? 0 : 1)};

  ${OptionRow}:hover &,
  ${OptionRow}:focus-visible & {
    opacity: 1;
  }
`;

export interface Option {
  value: string;
  label: string;
  color?: string;
  icon?: IconNames;
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
  revealChecksOnHover?: boolean;
}

const OptionList = ({
  options,
  selected,
  onToggle,
  searchable = options.length >= SEARCHABLE_FROM,
  revealChecksOnHover = false,
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
            variant="bo"
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
            width="100%"
          >
            <OptionRow
              type="button"
              role="menuitemcheckbox"
              aria-checked={isSelected}
              title={option.label}
              disabled={option.disabled}
              onClick={() => onToggle(option.value)}
            >
              <Box display="flex" alignItems="center" gap="8px" width="100%">
                <CheckSlot
                  revealOnHover={
                    revealChecksOnHover && !isSelected && !option.partial
                  }
                  onClick={(event) => event.stopPropagation()}
                >
                  <Checkbox
                    size="16px"
                    checkedColor="primary"
                    checked={isSelected}
                    indeterminate={!isSelected && option.partial}
                    disabled={option.disabled}
                    onChange={() => onToggle(option.value)}
                    tabIndex={-1}
                  />
                </CheckSlot>
                {option.color && (
                  <Box
                    flex="0 0 8px"
                    width="8px"
                    height="8px"
                    borderRadius="50%"
                    background={option.color}
                  />
                )}
                {option.icon && (
                  <Icon
                    name={option.icon}
                    width="16px"
                    height="16px"
                    fill={colors.coolGrey500}
                  />
                )}
                <Box flexGrow={1} minWidth="0">
                  <Text
                    variant="boLabel"
                    m="0"
                    color={option.disabled ? 'coolGrey500' : 'textPrimary'}
                    textAlign="left"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
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
            </OptionRow>
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
