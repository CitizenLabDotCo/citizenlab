import React from 'react';

import { Button } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import ideaCardsMessages from '../messages';

interface Props {
  onClick: () => void;
  filtersActive: boolean;
}

const ResetFiltersButton = ({ onClick, filtersActive }: Props) => {
  return (
    <Button onClick={onClick} buttonStyle="text" disabled={!filtersActive}>
      <FormattedMessage {...ideaCardsMessages.resetFilters} />
    </Button>
  );
};

export default ResetFiltersButton;
