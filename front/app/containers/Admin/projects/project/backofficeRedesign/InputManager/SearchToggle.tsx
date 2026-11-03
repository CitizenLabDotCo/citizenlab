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

const SearchToggle = ({ searchTerm, onChange, resultCount }: Props) => {
  const { formatMessage } = useIntl();
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
        label={formatMessage(messages.searchInputs)}
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
        placeholder={formatMessage(messages.searchInputs)}
        ariaLabel={formatMessage(messages.searchInputs)}
        debounce={500}
        size="small"
        onChange={onChange}
        a11y_numberOfSearchResults={resultCount}
        setInputRef={(input) => input?.focus()}
        dataCy="e2e-input-manager-search"
      />
    </Box>
  );
};

export default SearchToggle;
