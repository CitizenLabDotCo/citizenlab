import React from 'react';

import { Button } from '@citizenlab/cl2-component-library';

import { IIdeaQueryParameters } from 'api/ideas/types';

import { FormattedMessage } from 'utils/cl-intl';

import ideaCardsMessages from '../messages';

interface Props {
  onClick: () => void;
  ideaQueryParameters: IIdeaQueryParameters;
}

const ResetFiltersButton = ({ onClick, ideaQueryParameters }: Props) => {
  const filtersActive = !!(
    ideaQueryParameters.search ||
    ideaQueryParameters.idea_status ||
    ideaQueryParameters.topics
  );

  return (
    <Button onClick={onClick} buttonStyle="text" disabled={!filtersActive}>
      <FormattedMessage {...ideaCardsMessages.resetFilters} />
    </Button>
  );
};

export default ResetFiltersButton;
