import React from 'react';

import { colors, media } from '@citizenlab/cl2-component-library';
import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import useProjectById from 'api/projects/useProjectById';

import { adminCustomPageContentLink } from 'containers/Admin/pagesAndMenu/routes';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { canModerateProjectByIds } from 'utils/permissions/rules/projectPermissions';
import { isAdmin } from 'utils/permissions/roles';

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
  const { data: authUser } = useAuthUser();
  // Only fetched for project-scoped pages (the hook is disabled when id is
  // nullish), so we can pass the project's folder/space to mirror the backend's
  // StaticPagePolicy#update?, which lets project/folder/space moderators edit.
  const { data: project } = useProjectById(projectId);

  const userCanEditPage = projectId
    ? canModerateProjectByIds({
        projectId,
        folderId: project?.data.attributes.folder_id,
        spaceId: project?.data.attributes.space_id,
        user: authUser,
      })
    : // Global (projectless) pages remain admin-only.
      !isNilOrError(authUser) && isAdmin(authUser);

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
