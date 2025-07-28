import React from 'react';

import { IOption } from 'typings';

import Box from '../Box';
import CheckboxWithLabel from '../CheckboxWithLabel';

interface Props {
  selectorId: string;
  options: IOption[];
  selected: any[];
}

const DropdownContent = ({ selectorId, options, selected }: Props) => {
  return (
    <Box role="group" aria-labelledby={selectorId}>
      {options.map((option) => {
        const checked = !!selected.includes(option.value);

        return (
          <CheckboxWithLabel
            key={option.value}
            checked={checked}
            label={option.label}
            disabled={option.disabled}
            mb="8px"
            onChange={() => {}} // TODO
          />
        );
      })}
    </Box>
  );
};

export default DropdownContent;
