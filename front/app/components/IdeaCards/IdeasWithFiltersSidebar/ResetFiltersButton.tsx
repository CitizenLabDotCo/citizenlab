import React from 'react';

import { Button, fontSizes } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  onClick: () => void;
}

const ResetFiltersButton = ({ onClick }: Props) => {
  return (
    <Button buttonStyle="text" fontSize={`${fontSizes.s}px`} onClick={onClick}>
      <FormattedMessage {...messages.resetFilters} />
    </Button>
  );
};

export default ResetFiltersButton;
