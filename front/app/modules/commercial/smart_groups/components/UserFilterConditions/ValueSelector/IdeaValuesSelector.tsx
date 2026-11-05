import React from 'react';

import IdeaMultiSelect from 'components/UI/IdeaSelect/IdeaMultiSelect';

import { TRule } from '../rules';

export interface Props {
  rule: TRule;
  // Undefined until the manager has picked at least one input.
  value?: string[];
  onChange: (value: string[]) => void;
}

const IdeaValuesSelector = ({ value, onChange }: Props) => {
  return (
    <IdeaMultiSelect
      selectedIdeaIds={value ?? []}
      showLabel={false}
      onChange={onChange}
    />
  );
};

export default IdeaValuesSelector;
