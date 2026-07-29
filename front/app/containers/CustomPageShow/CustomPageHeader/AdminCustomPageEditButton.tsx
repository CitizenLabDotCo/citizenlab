import React from 'react';

import { colors, media } from '@citizenlab/cl2-component-library';
import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';

import useProjectById from 'api/projects/useProjectById';

import { adminCustomPageContentLink } from 'containers/Admin/pagesAndMenu/routes';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { injectIntl } from 'utils/cl-intl';
import { usePermission } from 'utils/permissions';

import messages from '../messages';

// Absolutely positioned at top-right on wider viewports, but switches to
// in-flow on narrow viewports / 400% zoom so the button doesn't overlap
// the page heading (WCAG 1.4.10 Reflow).

interface Props {
  pageId: string;
  projectId?: string | null;
}

const AdminCustomPageEditButton = ({
  pageId,
  projectId,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  // Only fetched for project pages (hook disabled when id is nullish); passed
  // as the rule's context to resolve moderator access.
  const { data: project } = useProjectById(projectId);

  const userCanEditPage = usePermission({
    item: { type: 'static_page' },
    action: 'edit',
    context: project?.data,
  });

  const editLink = projectId
    ? { linkTo: `/admin/projects/${projectId}/pages/${pageId}` }
    : adminCustomPageContentLink(pageId);

  return userCanEditPage ? (
    <PositionWrapper>
      <ButtonWithLink
        icon="edit"
        {...editLink}
        buttonStyle="secondary"
        bgColor={colors.white}
        padding="5px 8px"
      >
        {formatMessage(messages.editPage)}
      </ButtonWithLink>
    </PositionWrapper>
  ) : null;
};

export default injectIntl(AdminCustomPageEditButton);

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
