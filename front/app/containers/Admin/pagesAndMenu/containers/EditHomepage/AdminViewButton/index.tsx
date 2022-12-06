import React from 'react';
// i18n
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import Button from 'components/UI/Button';

interface Props {
  linkTo: string;
  buttonTextMessageDescriptor: MessageDescriptor;
}

// to be moved to a general component folder (+ refactor existing buttons using this?)

const AdminViewButton = ({ linkTo, buttonTextMessageDescriptor }: Props) => {
  return (
    <Button
      buttonStyle="admin-dark"
      icon="eye"
      id="to-project"
      openLinkInNewTab
      linkTo={linkTo}
    >
      <FormattedMessage {...buttonTextMessageDescriptor} />
    </Button>
  );
};

export default AdminViewButton;
