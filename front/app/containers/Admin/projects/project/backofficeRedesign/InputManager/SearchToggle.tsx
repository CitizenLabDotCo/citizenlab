import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import SearchInput from 'components/UI/SearchInput';

import ToolbarIconButton from './ToolbarIconButton';

interface Props {
  label: string;
  searchTerm: string | undefined;
  onChange: (term: string | null) => void;
  resultCount: number;
}

const SearchToggle = ({ label, searchTerm, onChange, resultCount }: Props) => {
  const [isOpen, setIsOpen] = useState(!!searchTerm);
  const [appliedTerm, setAppliedTerm] = useState(searchTerm);
  const [inputKey, setInputKey] = useState(0);

  if (searchTerm !== appliedTerm) {
    setAppliedTerm(searchTerm);
    if (!searchTerm) setInputKey((key) => key + 1);
  }

  if (!isOpen && !searchTerm) {
    return (
      <ToolbarIconButton
        icon="search"
        label={label}
        onClick={() => setIsOpen(true)}
        dataCy="e2e-input-manager-search-toggle"
      />
    );
  }

  return (
    <Box width="240px">
      <SearchInput
        key={inputKey}
        defaultValue={searchTerm}
        placeholder={label}
        ariaLabel={label}
        debounce={500}
        variant="bo"
        onChange={onChange}
        a11y_numberOfSearchResults={resultCount}
        setInputRef={(input) => input?.focus()}
        dataCy="e2e-input-manager-search"
      />
    </Box>
  );
};

export default SearchToggle;
