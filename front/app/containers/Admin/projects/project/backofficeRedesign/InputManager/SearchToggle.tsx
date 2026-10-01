import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import SearchInput from 'components/UI/SearchInput';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import ToolbarIconButton from './ToolbarIconButton';

interface Props {
  searchTerm: string | undefined;
  onChange: (term: string | null) => void;
  resultCount: number;
}

// Stays open while a search is applied, so the term is never hidden.
const SearchToggle = ({ searchTerm, onChange, resultCount }: Props) => {
  const { formatMessage } = useIntl();
  const [isOpen, setIsOpen] = useState(!!searchTerm);
  const [appliedTerm, setAppliedTerm] = useState(searchTerm);
  const [inputKey, setInputKey] = useState(0);

  // The input keeps its own text, so it is remounted when the search is
  // cleared from outside, e.g. by resetting the filters.
  if (searchTerm !== appliedTerm) {
    setAppliedTerm(searchTerm);
    if (!searchTerm) setInputKey((key) => key + 1);
  }

  if (!isOpen && !searchTerm) {
    return (
      <ToolbarIconButton
        icon="search"
        label={formatMessage(messages.searchInputs)}
        onClick={() => setIsOpen(true)}
      />
    );
  }

  return (
    <Box width="240px">
      <SearchInput
        key={inputKey}
        defaultValue={searchTerm}
        placeholder={formatMessage(messages.searchInputs)}
        ariaLabel={formatMessage(messages.searchInputs)}
        debounce={500}
        size="small"
        onChange={onChange}
        a11y_numberOfSearchResults={resultCount}
        setInputRef={(input) => input?.focus()}
      />
    </Box>
  );
};

export default SearchToggle;
