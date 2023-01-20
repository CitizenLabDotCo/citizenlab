import React, { useCallback } from 'react';

// components
import { Select } from '@citizenlab/cl2-component-library';

// typings
import { IOption } from 'typings';

interface Props {
  numberOfIdeas: number;
  onChange: (numberOfIdeas: number) => void;
}

const OPTIONS: IOption[] = Array(8)
  .fill(0)
  .map((_, i) => {
    const optionNumber = i + 3;
    return { value: optionNumber, label: optionNumber.toString() };
  });

const NumberOfIdeasDropdown = ({ numberOfIdeas, onChange }: Props) => {
  const handleChange = useCallback(
    (option: IOption) => {
      onChange(option.value);
    },
    [onChange]
  );

  return (
    <Select options={OPTIONS} value={numberOfIdeas} onChange={handleChange} />
  );
};

export default NumberOfIdeasDropdown;
