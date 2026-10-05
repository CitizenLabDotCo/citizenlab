import React, { useEffect, useRef, useState } from 'react';

import {
  Box,
  Button,
  Checkbox,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';

import SearchInput from 'components/UI/SearchInput';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

export interface TagOption {
  value: string;
  label: string;
}

interface Props {
  options: TagOption[];
  selected: string[];
  onToggle: (value: string) => void;
  onClose: () => void;
}

const TagPickerPopover = ({ options, selected, onToggle, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  const query = search.trim().toLowerCase();
  const visibleOptions = options.filter(({ label }) =>
    label.toLowerCase().includes(query)
  );

  return (
    <Box
      position="absolute"
      top="calc(100% + 8px)"
      left="0"
      zIndex="10"
      w="328px"
      p="12px"
      background={colors.white}
      border={`1px solid ${colors.grey300}`}
      borderRadius="12px"
      boxShadow="0 8px 28px rgba(20, 25, 40, 0.14)"
    >
      <Box mb="8px">
        <SearchInput
          size="small"
          hideLabel
          debounce={0}
          placeholder={formatMessage(messages.searchTags)}
          ariaLabel={formatMessage(messages.searchTags)}
          onChange={(value) => setSearch(value ?? '')}
          setInputRef={(element) => (searchRef.current = element)}
          a11y_numberOfSearchResults={visibleOptions.length}
        />
      </Box>

      <Box maxHeight="248px" overflowY="auto">
        {visibleOptions.map(({ value, label }) => (
          <Box
            as="label"
            key={value}
            display="flex"
            alignItems="center"
            gap="10px"
            p="8px"
            cursor="pointer"
          >
            <Checkbox
              checked={selected.includes(value)}
              onChange={() => onToggle(value)}
              size="18px"
              checkedColor="primary"
            />
            <Text as="span" m="0" fontSize="s" color="textPrimary">
              {label}
            </Text>
          </Box>
        ))}
        {visibleOptions.length === 0 && (
          <Text textAlign="center" py="16px" m="0" variant="boHelper">
            {formatMessage(messages.noMatch)}
          </Text>
        )}
      </Box>

      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mt="8px"
        pt="10px"
        borderTop={`1px solid ${colors.grey200}`}
      >
        <Text as="span" m="0" variant="boMicro" aria-live="polite">
          {formatMessage(messages.selectedCount, { count: selected.length })}
        </Text>
        <Button
          buttonStyle="bo-text"
          width="auto"
          padding="2px 4px"
          textColor={colors.primary}
          onClick={onClose}
        >
          {formatMessage(messages.done)}
        </Button>
      </Box>
    </Box>
  );
};

export default TagPickerPopover;
