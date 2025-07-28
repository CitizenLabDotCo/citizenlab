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
  margin-bottom: 8px;
  padding: 8px;
  list-style: none;
  background: #fff;
  border-radius: ${(props) => props.theme.borderRadius};
  cursor: pointer;
  transition: all 80ms ease-out;
  padding: 0 10px;

  &.last {
    margin-bottom: 0px;
  }

  &:hover,
  &:focus,
  &.selected {
    background: ${(props) => props.theme.colors.tenantSecondary};
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

  const handleKeydown = (event: React.KeyboardEvent) => {
    console.log(event);
  };

  return (
    <Box role="group" aria-labelledby={selectorId}>
      {options.map((option) => {
        const checked = selected.includes(option.value);

        return (
          <CheckboxListItem key={option.value} tabIndex={0}>
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
