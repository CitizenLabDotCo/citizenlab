import React, { memo, useState, useEffect } from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { globalState } from 'services/globalState';
import { Outlet as RouterOutlet } from 'react-router-dom';

// permissions
import useAuthUser from 'hooks/useAuthUser';
import { usePermission } from 'services/permissions';
import HasPermission from 'components/HasPermission';

// components
import Sidebar from './sideBar/';
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';

// utils
import clHistory from 'utils/cl-router/history';
import { endsWith } from 'utils/helperUtils';

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
  min-height: calc(100vh - ${(props) => props.theme.menuHeight}px);
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
    const authUser = useAuthUser();

    const [adminFullWidth, setAdminFullWidth] = useState(false);
    const [adminNoPadding, setAdminNoPadding] = useState(false);

    // The check in front/app/containers/Admin/routes.tsx already should do the same.
    // TODO: double check it and remove `userCanViewAdmin`
    const userCanViewPath = usePermission({
      // If we're in this component, we're sure
      // that the path is an admin path
      item: { type: 'route', path: pathname },
      action: 'access',
    });

    useEffect(() => {
      const subscriptions = [
        globalState
          .init('AdminFullWidth', { enabled: false })
          .observable.subscribe(({ enabled }) => setAdminFullWidth(enabled)),
        globalState
          .init('AdminNoPadding', { enabled: false })
          .observable.subscribe(({ enabled }) => setAdminNoPadding(enabled)),
      ];
      return () => {
        subscriptions.forEach((subscription) => subscription.unsubscribe());
      };
    }, []);

    useEffect(() => {
      if (authUser === null || (authUser !== undefined && !userCanViewPath)) {
        clHistory.push('/');
      }
    }, [authUser, userCanViewPath]);

    if (!userCanViewPath) {
      return null;
    }

    const noPadding = adminNoPadding || pathname.includes('admin/dashboard');
    const fullWidth =
      adminFullWidth === true ||
      endsWith(pathname, 'admin/moderation') ||
      pathname.includes('admin/dashboard');

    const whiteBg = endsWith(pathname, 'admin/moderation');

    return (
      <HasPermission
        item={{ type: 'route', path: '/admin/dashboard' }}
        action="access"
      >
        <Container className={`${className} ${whiteBg ? 'whiteBg' : ''}`}>
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
