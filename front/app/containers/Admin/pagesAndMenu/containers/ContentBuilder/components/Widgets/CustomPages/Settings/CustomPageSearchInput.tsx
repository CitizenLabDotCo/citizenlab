import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import ReactSelect from 'react-select';
import { useTheme } from 'styled-components';

import { ICustomPageData } from 'api/custom_pages/types';
import useCustomPages from 'api/custom_pages/useCustomPages';

import useLocalize from 'hooks/useLocalize';

import selectStyles from 'components/UI/MultipleSelect/styles';

import { getOptionId, getOptions } from './utils';

interface Props {
  customPageIds: string[];
  onChange: (option?: ICustomPageData) => void;
}

const CustomPageSearchInput = ({ customPageIds, onChange }: Props) => {
  const [search, setSearch] = useState('');
  const theme = useTheme();
  const localize = useLocalize();

  const { data: customPages } = useCustomPages();

  const handleInputChange = (searchTerm: string) => {
    setSearch(searchTerm);
  };

  const options = getOptions(
    customPages?.data,
    customPageIds,
    search,
    localize
  );

  return (
    <Box>
      <ReactSelect
        inputId="custom-page-search-input"
        isSearchable
        backspaceRemovesValue={false}
        menuShouldScrollIntoView={true}
        value={null}
        inputValue={search}
        placeholder={''}
        options={options}
        getOptionValue={getOptionId}
        formatOptionLabel={(option) =>
          option ? (
            <Box>{localize(option.attributes.title_multiloc)}</Box>
          ) : null
        }
        menuPlacement="top"
        styles={selectStyles(theme)}
        filterOption={() => true}
        onInputChange={handleInputChange}
        onChange={onChange}
        closeMenuOnScroll={false}
        closeMenuOnSelect={false}
      />
    </Box>
  );
};

export default CustomPageSearchInput;
