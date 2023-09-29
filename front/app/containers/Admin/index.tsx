import React, { memo, useEffect } from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { Outlet as RouterOutlet } from 'react-router-dom';

// permissions
import useAuthUser from 'api/me/useAuthUser';
import { usePermission } from 'utils/permissions';
import HasPermission from 'components/HasPermission';

// components
import Sidebar from './sideBar/';
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';

// utils
import clHistory from 'utils/cl-router/history';

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
    }, [authUser, userCanViewPath]);

    if (!userCanViewPath) {
      return null;
    }

    const noPadding =
      pathname.includes('admin/dashboard') ||
      pathname.includes('admin/initiatives') ||
      pathname.includes('admin/messaging') ||
      pathname.includes('admin/settings') ||
      pathname.includes('admin/ideas') ||
      pathname.includes('admin/reporting');

    const fullWidth =
      pathname.includes('admin/dashboard') ||
      pathname.includes('admin/initiatives') ||
      pathname.includes('admin/messaging') ||
      pathname.includes('admin/settings') ||
      pathname.includes('admin/ideas') ||
      pathname.includes('admin/reporting');

    return (
      <HasPermission
        item={{ type: 'route', path: '/admin/dashboard' }}
        action="access"
      >
        <Container className={className}>
          <Sidebar />
          <RightColumn
            className={`${fullWidth && 'fullWidth'} ${
              noPadding && 'noPadding'
            }`}
          >
            <RouterOutlet />
          </RightColumn>
        </Container>
      </HasPermission>
    );
  }
);

export default withRouter(AdminPage);
