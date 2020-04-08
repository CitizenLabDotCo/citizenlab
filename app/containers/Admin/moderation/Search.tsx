import React, { useState, useCallback } from 'react';
import SearchInput from 'components/UI/SearchInput';

interface Props {
  className?: string;
  onChange: (searchTerm: string) => void;
}

const Search = React.memo(({ onChange, className }: Props) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const handleOnChange = useCallback((searchTerm: string) => {
    setSearchTerm(searchTerm);
    onChange(searchTerm);
  }, []);
  return (
    <SearchInput
      className={className}
      onChange={handleOnChange}
      value={searchTerm}
    />
  );
});

export default Search;
