import React, { useCallback } from 'react';

// components
import { Label, Select } from '@citizenlab/cl2-component-library';

// i18n
import messages from '../messages';
import { useIntl } from 'utils/cl-intl';

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
  const { formatMessage } = useIntl();

  const handleChange = useCallback(
    (option: IOption) => {
      onChange(option.value);
    },
    [onChange]
  );

  return (
    <>
      <Label>{formatMessage(messages.numberOfIdeas)}</Label>
      <Select options={OPTIONS} value={numberOfIdeas} onChange={handleChange} />
    </>
  );
};

export default NumberOfIdeasDropdown;
