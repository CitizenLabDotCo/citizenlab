import Button from 'components/UI/Button';
import useAuthUser from 'hooks/useAuthUser';
import React from 'react';
import { InjectedIntlProps } from 'react-intl';
import { isAdmin } from 'services/permissions/roles';
import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import messages from '../messages';

interface Props {
  linkTo: string;
}

const AdminCustomPageEditButton = ({
  linkTo,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const authUser = useAuthUser();

  const userCanEditPage =
    !isNilOrError(authUser) && isAdmin({ data: authUser });

  return userCanEditPage ? (
    <Button
      icon="edit"
      linkTo={linkTo}
      buttonStyle="secondary"
      padding="5px 8px"
      position="absolute"
      top="20px"
      right="20px"
    >
      {formatMessage(messages.editPage)}
    </Button>
  ) : null;
};

export default injectIntl(AdminCustomPageEditButton);
