import React from 'react';

import { Button } from '@citizenlab/cl2-component-library';

import tracks from 'components/IdeaCards/tracks';

import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import ideaCardsMessages from '../messages';

interface Props {
  filtersActive: boolean;
}

const ResetFiltersButton = ({ filtersActive }: Props) => {
  const handleOnClick = () => {
    trackEventByName(tracks.clearFiltersClicked);
    updateSearchParams({
      search: undefined,
      idea_status: undefined,
      topics: undefined,
    });
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
