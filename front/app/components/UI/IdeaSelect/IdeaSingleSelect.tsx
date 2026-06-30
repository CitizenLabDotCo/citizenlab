import React, { useState } from 'react';

import { Box, Label, Spinner, Text } from '@citizenlab/cl2-component-library';

import { IIdeaData } from 'api/ideas/types';
import useIdeaById from 'api/ideas/useIdeaById';
import useInfiniteIdeas from 'api/ideas/useInfiniteIdeas';

import { useIntl } from 'utils/cl-intl';

import BaseIdeaSelect from './BaseIdeaSelect';
import messages from './messages';
import OptionLabel from './OptionLabel';
import { Option } from './typings';
import { isOptionArray, optionIsIdea } from './utils';

interface Props {
  selectedIdeaId?: string | null;
  id?: string;
  inputId?: string;
  // Optional: when omitted the search spans the whole platform (e.g. smart-group
  // rules, which have no phase context).
  phaseId?: string;
  // Hide the built-in "Select an idea" label, e.g. when embedded in a compact row.
  showLabel?: boolean;
  onChange: (idea?: IIdeaData) => void;
}

// Heavily inspired by front/app/components/UI/UserSelect/index.tsx
const IdeaSingleSelect = ({
  selectedIdeaId,
  id = 'idea-select',
  inputId = 'idea-select-input',
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

  const { data: selectedIdea } = useIdeaById(selectedIdeaId ?? undefined);

  if (!ideas) {
    return (
      <Box mb="20px">
        <Spinner />
      </Box>
    );
  }

  if (ideasList.length === 0) {
    return (
      <Box mb="20px">
        <Text color="red600">{formatMessage(messages.noIdeaAvailable)}</Text>
      </Box>
    );
  }

  const handleChange = (option?: Option | readonly Option[]) => {
    // Single-select never receives an array, but the shared BaseIdeaSelect
    // onChange is typed for both modes.
    if (option && !isOptionArray(option) && optionIsIdea(option)) {
      onChange(option);
      return;
    }

    onChange(undefined);
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
        // We check if selectedIdeaId is present because setting it to null won't trigger a refetch so will have old data.
        // I'm preferring this over refetching on clear because it's faster and avoids a fetch that we technically don't need.
        value={(selectedIdeaId && selectedIdea?.data) || null}
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

export default IdeaSingleSelect;
