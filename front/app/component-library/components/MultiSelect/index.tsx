import React, { useState } from 'react';

import InputContainer from 'component-library/utils/containers/InputContainer';

import Box from '../Box';
import Dropdown from '../Dropdown';

interface Props {
  title: string | JSX.Element;
}

const MultiSelect = ({ title }: Props) => {
  const [opened, setOpened] = useState(false);

  return (
    <Box>
      <Box>
        <InputContainer onClick={() => setOpened(!opened)}>
          {title}
        </InputContainer>
      </Box>
      <Dropdown
        opened={opened}
        onClickOutside={() => setOpened(false)}
        content={<div>Dropdown content</div>}
      />
    </Box>
  );
};

export default MultiSelect;
