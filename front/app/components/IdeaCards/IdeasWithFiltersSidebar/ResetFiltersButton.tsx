import React from 'react';

import { Button } from '@citizenlab/cl2-component-library';

import { IIdeaQueryParameters } from 'api/ideas/types';

import { scrollToTopIdeasList } from 'components/FilterBoxes/utils';
import tracks from 'components/IdeaCards/tracks';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import ideaCardsMessages from '../messages';

interface Props {
  ideaQueryParameters: IIdeaQueryParameters;
}

const ResetFiltersButton = ({ ideaQueryParameters }: Props) => {
  const filtersActive = !!(
    ideaQueryParameters.search ||
    ideaQueryParameters.idea_status ||
    ideaQueryParameters.input_topics
  );

  const handleOnClick = () => {
    trackEventByName(tracks.clearFiltersClicked);
    updateSearchParams({
      search: undefined,
      idea_status: undefined,
      input_topics: undefined,
    });
    scrollToTopIdeasList();
  };

  return (
    <Button
      onClick={handleOnClick}
      buttonStyle="text"
      disabled={!filtersActive}
    >
      <FormattedMessage {...ideaCardsMessages.resetFilters} />
    </Button>
  );
};

export default ResetFiltersButton;
