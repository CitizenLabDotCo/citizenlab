import React, { useId, useState } from 'react';

import InputContainer from 'component-library/utils/containers/InputContainer';
import { IOption } from 'typings';

import Box from '../Box';
import CheckboxWithLabel from '../CheckboxWithLabel';
import Dropdown from '../Dropdown';

interface Props {
  title: string | JSX.Element;
  selected?: any[];
  options: IOption[];
  onChange?: (value: string) => void;
}

const MultiSelect = ({ title, selected, options }: Props) => {
  const [opened, setOpened] = useState(false);
  const selectorId = useId();

  return (
    <Box>
      <Box>
        <InputContainer id={selectorId} onClick={() => setOpened(!opened)}>
          {title}
        </InputContainer>
      </Box>
      <Dropdown
        opened={opened}
        onClickOutside={() => setOpened(false)}
        content={
          <Box role="group" aria-labelledby={selectorId}>
            {options.map((option) => {
              const checked = !!selected?.includes(option.value);

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
        }
      />
    </Box>
  );
};

export default MultiSelect;
