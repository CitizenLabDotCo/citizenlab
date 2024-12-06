import React, { useMemo, FC, useEffect } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';
import ReactSelect from 'react-select';
import { useTheme } from 'styled-components';

import { IIdeaData } from 'api/ideas/types';

import selectStyles from 'components/UI/MultipleSelect/styles';

import { Option } from './typings';
import { getOptionId } from './utils';

interface Props {
  id?: string;
  inputId?: string;
  value: IIdeaData | null;
  inputValue?: string;
  options: Option[];
  components?: { Option: FC };
  getOptionLabel: (option: Option) => any;
  /* onInputChange should be a stable reference! */
  onInputChange: (searchTerm: string) => void;
  onMenuScrollToBottom: () => void;
  onChange: (option?: Option) => void;
}

const BaseIdeaSelect = ({
  id,
  inputId,
  value,
  inputValue,
  options,
  components,
  getOptionLabel,
  onInputChange,
  onMenuScrollToBottom,
  onChange,
}: Props) => {
  const theme = useTheme();
  const handleInputChange = useMemo(() => {
    return debounce((searchTerm: string) => {
      onInputChange(searchTerm);
    }, 500);
  }, [onInputChange]);

  useEffect(() => {
    return () => {
      handleInputChange.cancel();
    };
  }, [handleInputChange]);

  const handleChange = (
    option: Option,
    { action }: { action: 'clear' | 'select-option' }
  ) => {
    if (action === 'clear') {
      onChange(undefined);
      return;
    }

    onChange(option);
  };

  return (
    <Box>
      <ReactSelect
        id={id}
        inputId={inputId}
        isSearchable
        blurInputOnSelect
        backspaceRemovesValue={false}
        menuShouldScrollIntoView={false}
        value={value}
        inputValue={inputValue}
        placeholder={''}
        options={options}
        getOptionValue={getOptionId}
        getOptionLabel={getOptionLabel}
        menuPlacement="auto"
        styles={selectStyles(theme)}
        filterOption={() => true}
        components={components}
        onInputChange={handleInputChange}
        onMenuScrollToBottom={onMenuScrollToBottom}
        onChange={handleChange as any}
      />
    </Box>
  );
};

export default BaseIdeaSelect;
