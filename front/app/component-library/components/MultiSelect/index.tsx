import React, { useId, useState } from 'react';

import InputContainer from 'component-library/utils/containers/InputContainer';

import Box from '../Box';
import Dropdown from '../Dropdown';

import DropdownContent from './DropdownContent';
import { Option } from './typings';

const NOOP = () => {};

interface Props {
  title: string | JSX.Element;
  selected?: string[];
  options: Option[];
  onChange?: (values: string[]) => void;
}

const MultiSelect = ({ title, selected = [], options, onChange }: Props) => {
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
            onChange={onChange ?? NOOP}
          />
        }
      />
    </Box>
  );
};

export default MultiSelect;
