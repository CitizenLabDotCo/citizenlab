import React from 'react';

import styled from 'styled-components';

import Box from '../Box';
import CheckboxWithLabel from '../CheckboxWithLabel';

import { Option } from './typings';

const CheckboxListItem = styled.li`
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
  }
`;

interface Props {
  selectorId: string;
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
}

const DropdownContent = ({
  selectorId,
  options,
  selected,
  onChange,
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
    if (event.key === 'Space') {
      event.preventDefault();
      handleCheckboxClick(value)();
    }
  };

  return (
    <Box role="group" aria-labelledby={selectorId}>
      {options.map((option) => {
        const checked = selected.includes(option.value);

        return (
          <CheckboxListItem
            key={option.value}
            tabIndex={option.disabled ? -1 : 0}
            onKeyDown={handleKeydown(option.value)}
          >
            <CheckboxWithLabel
              tabIndex={-1}
              checked={checked}
              label={option.label}
              disabled={option.disabled}
              onChange={handleCheckboxClick(option.value)}
            />
          </CheckboxListItem>
        );
      })}
    </Box>
  );
};

export default DropdownContent;
