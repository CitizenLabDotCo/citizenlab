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
  value: IIdeaData | IIdeaData[] | null;
  inputValue?: string;
  isMulti?: boolean;
  options: Option[];
  components?: { Option: FC };
  getOptionLabel: (option: Option) => any;
  /* onInputChange should be a stable reference! */
  onInputChange: (searchTerm: string) => void;
  onMenuScrollToBottom: () => void;
  // Single mode emits one option (or undefined when cleared); multi mode emits
  // the full array of currently-selected options.
  onChange: (option?: Option | readonly Option[]) => void;
}

const BaseIdeaSelect = ({
  id,
  inputId,
  value,
  inputValue,
  isMulti,
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
    newValue: Option | readonly Option[] | null,
    { action }: { action: string }
  ) => {
    // Single mode special-cases the clear action to emit `undefined`.
    if (!isMulti && action === 'clear') {
      onChange(undefined);
      return;
    }

    // Multi: forward the full selected array; single: the chosen option.
    onChange(newValue ?? undefined);
  };

  return (
    <Box>
      <ReactSelect
        id={id}
        inputId={inputId}
        isMulti={isMulti}
        isSearchable
        // In multi mode keep focus so the user can add several inputs in a row.
        blurInputOnSelect={!isMulti}
        backspaceRemovesValue={!!isMulti}
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
