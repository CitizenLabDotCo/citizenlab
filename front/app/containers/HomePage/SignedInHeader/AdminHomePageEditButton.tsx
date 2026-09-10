import React from 'react';

import { colors, media } from '@citizenlab/cl2-component-library';
import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';

import { ADMIN_HOMEPAGE_BUILDER_PATH } from 'containers/Admin/pagesAndMenu/routes';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { injectIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import messages from '../messages';

// Absolutely positioned at top-right on wider viewports, but switches to
// in-flow on narrow viewports / 400% zoom so the button doesn't overlap
// the page heading (WCAG 1.4.10 Reflow).

const AdminHomePageEditButton = ({
  intl: { formatMessage },
}: WrappedComponentProps) => {
  const userCanEditPage = usePermission({
    item: { type: 'homepage' },
    action: 'edit',
  });

  return userCanEditPage ? (
    <PositionWrapper>
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
    </PositionWrapper>
  ) : null;
};

export default injectIntl(AdminHomePageEditButton);

// The reflowed gutter matches the 20px NoBannerContainer gives the custom page's
// edit button, so the button lines up with page content rather than sitting flush
// against the viewport edge.
const PositionWrapper = styled.div`
  position: absolute;
  top: 30px;
  right: 30px;

  ${media.tablet`
    position: static;
    width: fit-content;
    margin-top: 16px;
    margin-bottom: 16px;
    margin-left: 15px;
  `}
`;
