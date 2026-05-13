import React from 'react';

import { colors, media } from '@citizenlab/cl2-component-library';
import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';

import { adminCustomPageContentPath } from 'containers/Admin/pagesAndMenu/routes';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { isAdmin } from 'utils/permissions/roles';

import messages from '../messages';

// Absolutely positioned at top-right on wider viewports, but switches to
// in-flow on narrow viewports / 400% zoom so the button doesn't overlap
// the page heading (WCAG 1.4.10 Reflow).
const PositionWrapper = styled.div`
  position: absolute;
  top: 50px;
  right: 30px;

  ${media.tablet`
    position: static;
    width: fit-content;
    margin-top: 16px;
  `}
`;

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
    <PositionWrapper>
      <ButtonWithLink
        icon="edit"
        linkTo={adminCustomPageContentPath(pageId)}
        buttonStyle="secondary-outlined"
        bgColor={colors.white}
        padding="5px 8px"
      >
        {formatMessage(messages.editPage)}
      </ButtonWithLink>
    </PositionWrapper>
  ) : null;
};

export default injectIntl(AdminCustomPageEditButton);
