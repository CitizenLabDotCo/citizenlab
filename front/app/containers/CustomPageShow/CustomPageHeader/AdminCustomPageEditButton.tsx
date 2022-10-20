import Button from 'components/UI/Button';
import { adminCustomPageContentPath } from 'containers/Admin/pagesAndMenu/routes';
import useAuthUser from 'hooks/useAuthUser';
import React from 'react';
import { WrappedComponentProps } from 'react-intl';
import { isAdmin } from 'services/permissions/roles';
import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import messages from '../messages';

interface Props {
  pageId: string;
}

const AdminCustomPageEditButton = ({
  pageId,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const authUser = useAuthUser();

  const userCanEditPage =
    !isNilOrError(authUser) && isAdmin({ data: authUser });

  return userCanEditPage ? (
    <Button
      icon="edit"
      linkTo={adminCustomPageContentPath(pageId)}
      buttonStyle="secondary"
      padding="5px 8px"
      position="absolute"
      top="30px"
      right="30px"
    >
      {formatMessage(messages.editPage)}
    </Button>
  ) : null;
};

export default injectIntl(AdminCustomPageEditButton);
