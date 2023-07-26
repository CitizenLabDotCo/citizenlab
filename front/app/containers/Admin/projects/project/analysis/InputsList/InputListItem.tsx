import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import { IInputsData } from 'api/analysis_inputs/types';
import T from 'components/T';

interface Props {
  input: IInputsData;
  onSelect: () => void;
  selected: boolean;
}

const InputListItem = ({ input, onSelect, selected }: Props) => {
  if (!input) return null;

  return (
    <Box onClick={() => onSelect()}>
      {selected && <span>✅</span>}
      <T value={input.attributes.title_multiloc} />
    </Box>
  );
};

export default InputListItem;
