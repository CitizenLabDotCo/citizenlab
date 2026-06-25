import React, { useState } from 'react';

import { Box, Label, Spinner } from '@citizenlab/cl2-component-library';
import { useQueries } from '@tanstack/react-query';

import ideasKeys from 'api/ideas/keys';
import { IIdeaData } from 'api/ideas/types';
import { fetchIdea } from 'api/ideas/useIdeaById';
import useInfiniteIdeas from 'api/ideas/useInfiniteIdeas';

import { useIntl } from 'utils/cl-intl';

import BaseIdeaSelect from './BaseIdeaSelect';
import messages from './messages';
import OptionLabel from './OptionLabel';
import { Option } from './typings';
import { isOptionArray, optionIsIdea } from './utils';

interface Props {
  selectedIdeaIds: string[];
  id?: string;
  inputId?: string;
  // Optional: when omitted the search spans the whole platform (smart-group
  // rules have no phase context). No `transitive` is passed, so proposals are
  // included.
  phaseId?: string;
  showLabel?: boolean;
  onChange: (ideaIds: string[]) => void;
}

// Multi-select sibling of IdeaSelect: lets the user search and select any number
// of inputs across the platform, instead of a fixed page of candidates.
const IdeaMultiSelect = ({
  selectedIdeaIds,
  id = 'idea-multi-select',
  inputId = 'idea-multi-select-input',
  phaseId,
  showLabel = true,
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

  const { formatMessage } = useIntl();
  const ideasList = ideas?.pages.flatMap((page) => page.data) ?? [];

  // The selected inputs are usually not in the current search page, so resolve
  // their titles by fetching each by id in parallel (there is no fetch-by-ids
  // endpoint). useQueries keeps this rules-of-hooks-safe for a dynamic length.
  const selectedIdeaResults = useQueries({
    queries: selectedIdeaIds.map((ideaId) => ({
      queryKey: ideasKeys.item({ id: ideaId }),
      queryFn: () => fetchIdea({ id: ideaId }),
    })),
  });
  const selectedIdeas = selectedIdeaResults
    .map((result) => result.data?.data)
    // Drop still-loading ids and any that 404 (e.g. a deleted input).
    .filter((idea): idea is IIdeaData => !!idea);

  if (!ideas) {
    return (
      <Box mb="20px">
        <Spinner />
      </Box>
    );
  }

  const handleChange = (newValue?: Option | readonly Option[]) => {
    const selected = newValue && isOptionArray(newValue) ? newValue : [];
    // Ignore the `loadMore` sentinel; keep only real inputs.
    onChange(selected.filter(optionIsIdea).map((idea) => idea.id));
  };

  return (
    <Box>
      {showLabel && (
        <Label htmlFor={id}>
          <span>{formatMessage(messages.selectIdea)}</span>
        </Label>
      )}
      <BaseIdeaSelect
        id={id}
        inputId={inputId}
        isMulti
        value={selectedIdeas}
        options={
          hasNextPage ? [...ideasList, { value: 'loadMore' }] : ideasList
        }
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
      />
    </Box>
  );
};

export default IdeaMultiSelect;
