import React from 'react';
import { Button } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  onClick: () => void;
}

// to be moved to a general component folder (+ refactor existing buttons using this?)

const AdminEditButton = ({ onClick }: Props) => {
  return (
    <Button buttonStyle="secondary" icon="edit" onClick={onClick}>
      <FormattedMessage {...messages.edit} />
    </Button>
  );
};

export default AdminEditButton;
