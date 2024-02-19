import React, { useEffect, useMemo, useState } from 'react';

// components
import OptionLabel from './OptionLabel';

// typings
import ReactSelect from 'react-select';
import { Option } from './typings';
import { debounce } from 'lodash-es';
import { getOptionId, optionIsIdea } from './utils';

import selectStyles from 'components/UI/MultipleSelect/styles';
import useInfiniteIdeas from 'api/ideas/useInfiniteIdeas';
import { IIdeaData } from 'api/ideas/types';
import useIdeaById from 'api/ideas/useIdeaById';

interface Props {
  selectedIdeaId?: string | null;
  placeholder?: string;
  id?: string;
  inputId?: string;
  phaseId: string;
  onChange: (user?: IIdeaData) => void;
}

const IdeaSelect = ({
  selectedIdeaId,
  placeholder,
  id = 'idea-select',
  inputId = 'idea-select-input',
  phaseId,
  onChange,
}: Props) => {
  const [searchValue, setSearchValue] = useState('');
  const {
    data: ideas,
    isLoading,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteIdeas({
    search: searchValue,
  });

  const ideasList = ideas?.pages.flatMap((page) => page.data) ?? [];

  // TODO: remove "?? undefined"
  const { data: selectedIdea } = useIdeaById(selectedIdeaId ?? undefined);

  const handleInputChange = useMemo(() => {
    return debounce((searchTerm: string) => {
      setSearchValue(searchTerm);
    }, 500);
  }, [setSearchValue]);

  useEffect(() => {
    return () => {
      handleInputChange.cancel();
    };
  }, [handleInputChange]);

  const handleChange = (option?: Option) => {
    console.log({ option });
    if (!option) {
      onChange(undefined);
      return;
    }

    if (optionIsIdea(option)) onChange(option);
  };

  const handleChangeWithAction = (
    option: Option,
    { action }: { action: 'clear' | 'select-option' }
  ) => {
    if (action === 'clear') {
      handleChange(undefined);
      return;
    }

    handleChange(option);
  };

  return (
    <ReactSelect
      id={id}
      inputId={inputId}
      isSearchable
      blurInputOnSelect
      backspaceRemovesValue={false}
      menuShouldScrollIntoView={false}
      isClearable
      value={(selectedIdeaId && selectedIdea?.data) || null}
      placeholder={placeholder}
      options={hasNextPage ? [...ideasList, { value: 'loadMore' }] : ideasList}
      getOptionValue={getOptionId}
      getOptionLabel={(option) =>
        (
          <OptionLabel
            option={option}
            hasNextPage={hasNextPage}
            isLoading={isLoading}
            fetchNextPage={() => fetchNextPage()}
          />
        ) as any
      }
      menuPlacement="auto"
      styles={selectStyles()}
      filterOption={() => true}
      // onMenuOpen={handleChange}
      onInputChange={handleInputChange}
      onMenuScrollToBottom={() => fetchNextPage()}
      onChange={handleChangeWithAction as any}
    />
  );
};

export default IdeaSelect;
