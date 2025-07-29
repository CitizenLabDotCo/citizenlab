import React from 'react';

import styled from 'styled-components';

import { colors } from '../../utils/styleUtils';
import Box from '../Box';
import CheckboxWithLabel from '../CheckboxWithLabel';
import Spinner from '../Spinner';
import Text from '../Text';

import SearchInput from './SearchInput';
import { Option } from './typings';

const CheckboxListItem = styled.li<{ disabled?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  margin: 0px;
  margin-bottom: 4px;
  padding: 8px 8px;
  list-style: none;
  background: #fff;
  border-radius: ${(props) => props.theme.borderRadius};
  cursor: pointer;
  transition: all 80ms ease-out;

  &.last {
    margin-bottom: 0px;
  }

  &:hover,
  &:focus,
  &.selected {
    background: ${(props) => props.theme.colors.tenantPrimary};
    label > span {
      color: ${colors.white};
    }
  }
`;

interface Props {
  selectorId: string;
  options: Option[];
  selected: string[];
  isLoading: boolean;
  searchValue?: string;
  searchPlaceholder?: string;
  onChange: (values: string[]) => void;
  onSearch?: (searchTerm: string) => void;
  a11y_clearSearchButtonActionMessage: string;
}

const DropdownContent = ({
  selectorId,
  options,
  selected,
  isLoading,
  searchValue,
  searchPlaceholder,
  onChange,
  onSearch,
  a11y_clearSearchButtonActionMessage,
}: Props) => {
  const handleCheckboxClick = (value: string) => () => {
    const selectedClone = [...selected];

    if (selectedClone.includes(value)) {
      const index = selectedClone.indexOf(value);
      selectedClone.splice(index, 1);
    } else {
      selectedClone.push(value);
    }

    onChange(selectedClone);
  };

  const handleKeydown = (value: string) => (event: React.KeyboardEvent) => {
    if (event.code === 'Space') {
      event.preventDefault();
      handleCheckboxClick(value)();
    }
  };

  return (
    <Box role="group" aria-labelledby={selectorId}>
      {onSearch && (
        <SearchInput
          value={searchValue}
          placeholder={searchPlaceholder}
          onSearch={onSearch}
          a11y_clearSearchButtonActionMessage={
            a11y_clearSearchButtonActionMessage
          }
        />
      )}

      {options.map((option) => {
        const checked = selected.includes(option.value);

        return (
          <CheckboxListItem
            key={option.value}
            tabIndex={0}
            role="checkbox"
            aria-checked={checked}
            onKeyDown={handleKeydown(option.value)}
          >
            <CheckboxWithLabel
              tabIndex={-1}
              checked={checked}
              label={
                <Text as="span" color="textSecondary" fontSize="base" m="0">
                  {option.label}
                </Text>
              }
              onChange={handleCheckboxClick(option.value)}
            />
          </CheckboxListItem>
        );
      })}
      {isLoading && (
        <Box my="8px">
          <Spinner />
        </Box>
      )}
    </Box>
  );
};

export default DropdownContent;
