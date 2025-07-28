import React, { useId, useState } from 'react';

import InputContainer from 'component-library/utils/containers/InputContainer';

import Box from '../Box';
import Dropdown from '../Dropdown';

interface Props {
  title: string | JSX.Element;
}

const MultiSelect = ({ title }: Props) => {
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
            <li>Test</li>
          </Box>
        }
      />
    </Box>
  );
};

export default MultiSelect;
