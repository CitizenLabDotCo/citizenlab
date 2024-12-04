import React from 'react';

import { Button, fontSizes } from '@citizenlab/cl2-component-library';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';

import ideaCardsMessages from '../messages';

interface Props {
  onClick: () => void;
  filtersActive: boolean;
}

const ResetFiltersButton = ({ onClick, filtersActive }: Props) => {
  const buttonDisabled = !filtersActive;

  return (
    <Button
      onClick={onClick}
      buttonStyle="text"
      fontSize={`${fontSizes.s}px`}
      disabled={buttonDisabled}
    >
      <FormattedMessage {...ideaCardsMessages.resetFilters} />
      {buttonDisabled && (
        <ScreenReaderOnly>
          <FormattedMessage
            {...ideaCardsMessages.a11y_disabledResetFiltersDescription}
          />
        </ScreenReaderOnly>
      )}
    </Button>
  );
};

export default ResetFiltersButton;
