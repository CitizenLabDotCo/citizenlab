import React from 'react';

import { colors, Box, useBreakpoint } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import { ADMIN_HOMEPAGE_BUILDER_PATH } from 'containers/Admin/pagesAndMenu/routes';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import messages from '../messages';

// Absolutely positioned at top-right on wider viewports, but switches to
// in-flow on narrow viewports / 400% zoom so the button doesn't overlap
// the page heading (WCAG 1.4.10 Reflow).

const AdminHomePageEditButton = () => {
  const { data: authUser } = useAuthUser();
  const userIsAdmin = isAdmin(authUser);
  const { formatMessage } = useIntl();
  const isSmallerThanTablet = useBreakpoint('tablet');

  return userIsAdmin ? (
    <Box
      position={isSmallerThanTablet ? 'static' : 'absolute'}
      top="30px"
      right="30px"
      width="fit-content"
      marginTop={isSmallerThanTablet ? "16px" : ''}
      marginBottom={isSmallerThanTablet ? "16px" : ''}
      marginLeft={isSmallerThanTablet ? "15px" : ''}
    >
      <ButtonWithLink
        id="e2e-edit-homepage-button"
        icon="edit"
        to={ADMIN_HOMEPAGE_BUILDER_PATH}
        buttonStyle="secondary"
        bgColor={colors.white}
        padding="5px 8px"
      >
        {formatMessage(messages.editHomepage)}
      </ButtonWithLink>
    </Box>
  ) : null;
};

export default AdminHomePageEditButton;
