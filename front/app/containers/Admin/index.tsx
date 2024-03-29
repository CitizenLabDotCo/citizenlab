import React, { memo, useEffect } from 'react';

import { colors, media } from '@citizenlab/cl2-component-library';
import { Outlet as RouterOutlet } from 'react-router-dom';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';

import clHistory from 'utils/cl-router/history';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { usePermission } from 'utils/permissions';
import { isAdmin, isModerator } from 'utils/permissions/roles';

import Sidebar from './sideBar/';

// stlying
import 'assets/semantic/semantic.min.css';

const Container = styled.div`
  display: flex;
  background: ${colors.background};
  color: ${colors.primary};
  fill: ${colors.primary};
  border-color: ${colors.primary};

  &.whiteBg {
    background: #fff;
  }

  .ui,
  .ui.menu .item,
  .ui.table th,
  .ui a,
  .ui input,
  .ui .active td {
    color: ${colors.primary} !important;
  }

  .Select-control,
  .Select-value-label,
  .Select-value-icon,
  .Select-option {
    color: ${colors.primary} !important;
  }

  .ui.red {
    color: white !important;
  }
`;

export const RightColumn = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  margin: auto;
  display: flex;
  flex-direction: column;
  max-width: 1400px;
  min-height: 100vh;
  padding-top: 45px;
  padding-right: 51px;
  padding-bottom: 45px;
  padding-left: 51px;

  &.fullWidth {
    max-width: none;
  }

  &.noPadding {
    padding: 0;
    max-width: none;
  }

  @media print {
    padding: 0;
    max-width: none;
  }

  ${media.tablet`
    padding: 2.5rem 2.5rem;
  `}
`;

type Props = {
  className?: string;
};

const AdminPage = memo<Props & WithRouterProps>(
  ({ className, location: { pathname } }) => {
    const { data: authUser } = useAuthUser();

    // The check in front/app/containers/Admin/routes.tsx already should do the same.
    // TODO: double check it and remove `userCanViewAdmin`
    const userCanViewPath = usePermission({
      // If we're in this component, we're sure
      // that the path is an admin path
      item: { type: 'route', path: pathname },
      action: 'access',
    });

    useEffect(() => {
      if (authUser === null || (authUser !== undefined && !userCanViewPath)) {
        clHistory.push('/');
      }

      if (pathname.endsWith('/admin') || pathname.endsWith('/admin/')) {
        if (isAdmin(authUser)) {
          clHistory.push('/admin/dashboard/overview');
        }

        if (isModerator(authUser)) {
          clHistory.push('/admin/projects');
        }
      }
    }, [authUser, userCanViewPath, pathname]);

    if (!userCanViewPath) {
      return null;
    }
    const isFoldersPage = pathname.match(
      /admin\/projects\/folders\/[a-f0-9-]+(\/(?!projects(?:\/|$))[\w-]+)*/
    );
    const isProjectPage =
      pathname.match(
        /admin\/projects\/[a-f0-9-]+(\/(?!projects(?:\/|$))[\w-]+)*/
      ) && !isFoldersPage;

    const noPadding =
      pathname.includes('admin/dashboard') ||
      pathname.includes('admin/initiatives') ||
      pathname.includes('admin/messaging') ||
      pathname.includes('admin/settings') ||
      pathname.includes('admin/ideas') ||
      pathname.includes('admin/reporting') ||
      isProjectPage;

    const fullWidth =
      pathname.includes('admin/dashboard') ||
      pathname.includes('admin/initiatives') ||
      pathname.includes('admin/messaging') ||
      pathname.includes('admin/settings') ||
      pathname.includes('admin/ideas') ||
      pathname.includes('admin/reporting') ||
      isProjectPage;

    return (
      <Container className={className}>
        <Sidebar />
        <RightColumn
          className={`${fullWidth && 'fullWidth'} ${noPadding && 'noPadding'}`}
        >
          <RouterOutlet />
        </RightColumn>
      </Container>
    );
  }
);

export default withRouter(AdminPage);
