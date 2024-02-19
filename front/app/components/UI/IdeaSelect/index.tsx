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
import BaseIdeaSelect from './BaseIdeaSelect';

interface Props {
  selectedIdeaId?: string | null;
  placeholder?: string;
  id?: string;
  inputId?: string;
  phaseId: string;
  onChange: (idea?: IIdeaData) => void;
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
    sort: 'likes_count',
    search: searchValue,
    phase: phaseId,
  });

  const ideasList = ideas?.pages.flatMap((page) => page.data) ?? [];

  // TODO: remove "?? undefined"
  const { data: selectedIdea } = useIdeaById(selectedIdeaId ?? undefined);

  const handleChange = (option?: Option) => {
    if (!option) {
      onChange(undefined);
      return;
    }

    if (optionIsIdea(option)) onChange(option);
  };

  return (
    <BaseIdeaSelect
      id={id}
      inputId={inputId}
      // We check if selectedIdeaId is present because setting it to null won't trigger a refetch so will have old data.
      // I'm preferring this over refetching on clear because it's faster and avoids a fetch that we technically don't need.
      value={(selectedIdeaId && selectedIdea?.data) || null}
      // placeholder={placeholder}
      options={hasNextPage ? [...ideasList, { value: 'loadMore' }] : ideasList}
      getOptionLabel={(option) => (
        <OptionLabel
          option={option}
          hasNextPage={hasNextPage}
          isLoading={isLoading}
          fetchNextPage={() => fetchNextPage()}
        />
      )}
      onInputChange={setSearchValue}
      onMenuScrollToBottom={() => fetchNextPage()}
      onChange={handleChange}
      // onMenuOpen={handleChange}
    />
  );
};

export default IdeaSelect;
