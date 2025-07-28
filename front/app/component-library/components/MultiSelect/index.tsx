import React, { useId, useState } from 'react';

import InputContainer from 'component-library/utils/containers/InputContainer';

import Box from '../Box';
import Dropdown from '../Dropdown';

import DropdownContent from './DropdownContent';
import TitleMessage from './TitleMessage';
import { Option } from './typings';

interface Props {
  title: string | JSX.Element;
  selected?: string[];
  options: Option[];
  isLoading?: boolean;
  onChange: (values: string[]) => void;
}

const MultiSelect = ({
  title,
  selected = [],
  options,
  isLoading = false,
  onChange,
}: Props) => {
  const [opened, setOpened] = useState(false);
  const selectorId = useId();

  return (
    <Box>
      <Box>
        <InputContainer id={selectorId} onClick={() => setOpened(!opened)}>
          <TitleMessage title={title} selected={selected} options={options} />
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
            isLoading={isLoading}
            onChange={onChange}
          />
        }
      />
    </Box>
  );
};

export default MultiSelect;
