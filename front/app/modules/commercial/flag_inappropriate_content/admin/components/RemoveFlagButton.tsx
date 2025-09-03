import React from 'react';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  processing: boolean;
  onRemoveFlags: () => void;
  selectedActiveFlagsCount: number;
}

const RemoveFlagButton = ({
  processing,
  onRemoveFlags,
  selectedActiveFlagsCount,
}: Props) => {
  if (selectedActiveFlagsCount > 0) {
    return (
      <ButtonWithLink
        icon="alert-octagon-off"
        buttonStyle="admin-dark"
        processing={processing}
        onClick={onRemoveFlags}
      >
        <FormattedMessage
          {...messages.removeWarning}
          values={{
            numberOfItems: selectedActiveFlagsCount,
          }}
        />
      </ButtonWithLink>
    );
  }

  return null;
};

export default RemoveFlagButton;
