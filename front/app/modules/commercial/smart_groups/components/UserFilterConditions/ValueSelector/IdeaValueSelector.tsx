import React from 'react';

import { IIdeaData } from 'api/ideas/types';

import IdeaSingleSelect from 'components/UI/IdeaSelect/IdeaSingleSelect';

import { TRule } from '../rules';

export interface Props {
  rule: TRule;
  value: string;
  onChange: (value: string) => void;
}

const IdeaValueSelector = ({ value, onChange }: Props) => {
  const handleChange = (idea?: IIdeaData) => {
    onChange(idea?.id ?? '');
  };

  return (
    <IdeaSingleSelect
      selectedIdeaId={value}
      showLabel={false}
      onChange={handleChange}
    />
  );
};

export default IdeaValueSelector;
