import React, { useEffect, useRef, useState } from 'react';

import {
  Box,
  Button,
  CheckboxWithLabel,
  SearchInput,
  Text,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const Option = styled.div`
  border-radius: ${bo.borderRadius};
  font-size: 13px;
  line-height: 1.5;
  color: ${bo.colors.textHeadingStrong};

  &:hover {
    background: ${colors.grey100};
  }

  .e2e-checkbox:not(.checked) {
    opacity: 0;
    transition: opacity 0.1s;
  }

  &:hover .e2e-checkbox,
  input.focus-visible + .e2e-checkbox {
    opacity: 1;
  }
`;

const List = styled.div`
  max-height: 248px;
  overflow-y: auto;
  margin: 0 -6px;
  padding: 0 6px;
  scrollbar-width: thin;
`;

export interface PillOption {
  value: string;
  label: string;
}

interface Props {
  options: PillOption[];
  selected: string[];
  searchPlaceholder: string;
  noMatchLabel: string;
  onToggle: (value: string) => void;
  onClose: () => void;
}

const PillPickerPopover = ({
  options,
  selected,
  searchPlaceholder,
  noMatchLabel,
  onToggle,
  onClose,
}: Props) => {
  const { formatMessage } = useIntl();
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    searchRef.current?.focus({ preventScroll: true });
    popoverRef.current?.scrollIntoView({ block: 'nearest' });
  }, []);

  const query = search.trim().toLowerCase();
  const visibleOptions = options.filter(({ label }) =>
    label.toLowerCase().includes(query)
  );

  return (
    <Box
      ref={popoverRef}
      position="absolute"
      top="calc(100% + 8px)"
      left="0"
      right="0"
      mx="auto"
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
          variant="bo"
          hideLabel
          debounce={0}
          placeholder={searchPlaceholder}
          ariaLabel={searchPlaceholder}
          a11y_closeIconTitle={formatMessage(messages.clearSearch)}
          onChange={(value) => setSearch(value ?? '')}
          setInputRef={(element) => (searchRef.current = element)}
        />
      </Box>

      <List>
        {visibleOptions.map(({ value, label }) => (
          <Option key={value}>
            <CheckboxWithLabel
              p="8px"
              size="17px"
              checkedColor="primary"
              checked={selected.includes(value)}
              onChange={() => onToggle(value)}
              label={label}
            />
          </Option>
        ))}
        {visibleOptions.length === 0 && (
          <Text
            textAlign="center"
            py="16px"
            px="8px"
            m="0"
            fontSize="xs"
            color="coolGrey500"
          >
            {noMatchLabel}
          </Text>
        )}
      </List>

      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mt="8px"
        pt="10px"
        borderTop={`1px solid ${colors.grey200}`}
      >
        <Text
          as="span"
          m="0"
          fontSize="xs"
          color="coolGrey600"
          aria-live="polite"
        >
          {formatMessage(messages.selectedCount, { count: selected.length })}
        </Text>
        <Button
          buttonStyle="bo-text"
          width="auto"
          height="auto"
          padding="3px 4px 2px"
          fontSize="13px"
          fontWeight="500"
          lineHeight="19.5px"
          textColor={colors.primary}
          textHoverColor={colors.primary}
          onClick={onClose}
        >
          {formatMessage(messages.done)}
        </Button>
      </Box>
    </Box>
  );
};

export default PillPickerPopover;
