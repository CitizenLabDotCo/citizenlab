import React from 'react';

import Button from 'components/UI/Button';

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
      <Button
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
      </Button>
    );
  }

  return null;
};

export default RemoveFlagButton;
