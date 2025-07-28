import React from 'react';

import Box from '../Box';
import CheckboxWithLabel from '../CheckboxWithLabel';

import { Option } from './typings';

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
          <CheckboxWithLabel
            key={option.value}
            checked={checked}
            label={option.label}
            disabled={option.disabled}
            mb="8px"
            onChange={handleCheckboxClick(option.value)}
          />
        );
      })}
    </Box>
  );
};

export default DropdownContent;
