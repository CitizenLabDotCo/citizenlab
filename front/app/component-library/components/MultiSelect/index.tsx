import React, { useId, useState } from 'react';

import InputContainer from 'component-library/utils/containers/InputContainer';
import { IOption } from 'typings';

import Box from '../Box';
import Dropdown from '../Dropdown';

import DropdownContent from './DropdownContent';

interface Props {
  title: string | JSX.Element;
  selected?: any[];
  options: IOption[];
  onChange?: (value: string) => void;
}

const MultiSelect = ({ title, selected = [], options }: Props) => {
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
          <DropdownContent
            selectorId={selectorId}
            options={options}
            selected={selected}
          />
        }
      />
    </Box>
  );
};

export default MultiSelect;
