import React from 'react';

import { WrappedComponentProps } from 'react-intl';

import useAuthUser from 'api/me/useAuthUser';

import { adminCustomPageContentPath } from 'containers/Admin/pagesAndMenu/routes';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { isAdmin } from 'utils/permissions/roles';

import messages from '../messages';

interface Props {
  pageId: string;
}

const AdminCustomPageEditButton = ({
  pageId,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const { data: authUser } = useAuthUser();

  const userCanEditPage = !isNilOrError(authUser) && isAdmin(authUser);

  return userCanEditPage ? (
    <ButtonWithLink
      icon="edit"
      linkTo={adminCustomPageContentPath(pageId)}
      buttonStyle="secondary-outlined"
      padding="5px 8px"
      position="absolute"
      top="30px"
      right="30px"
    >
      {formatMessage(messages.editPage)}
    </ButtonWithLink>
  ) : null;
};

export default injectIntl(AdminCustomPageEditButton);
