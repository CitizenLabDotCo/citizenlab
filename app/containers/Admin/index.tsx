import React, { memo, useState, useEffect } from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { globalState } from 'services/globalState';
import { isAdmin, isModerator } from 'services/permissions/roles';
import { IUserData } from 'services/users';
import useAuthUser from 'hooks/useAuthUser';

// components
import Sidebar from './sideBar/';
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';

// utils
import clHistory from 'utils/cl-router/history';
import { endsWith, isNilOrError } from 'utils/helperUtils';

// stlying
import 'assets/semantic/semantic.min.css';

const Container = styled.div`
  display: flex;
  background: ${colors.background};
  color: ${colors.adminTextColor};
  fill: ${colors.adminTextColor};
  border-color: ${colors.adminTextColor};

  &.whiteBg {
    background: #fff;
  }

  .ui,
  .ui.menu .item,
  .ui.table th,
  .ui a,
  .ui input,
  .ui .active td {
    color: ${colors.adminTextColor} !important;
  }

  .Select-control,
  .Select-value-label,
  .Select-value-icon,
  .Select-option {
    color: ${colors.adminTextColor} !important;
  }

  .ui.red {
    color: white !important;
  }
`;

const RightColumn = styled.div`
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
  padding-bottom: 0px;
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

  ${media.smallerThan1280px`
    padding: 2.5rem 2.5rem;
  `}
`;

type Props = {
  className?: string;
  children: React.ReactNode;
};

const AdminPage = memo<Props & WithRouterProps>(
  ({ className, children, location: { pathname } }) => {
    const authUser = useAuthUser();

    const [adminFullWidth, setAdminFullWidth] = useState(false);
    const [adminNoPadding, setAdminNoPadding] = useState(false);

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
      if (
        authUser === null ||
        (!isNilOrError(authUser) && !userCanViewAdmin(authUser))
      ) {
        clHistory.push('/');
      }
    }, [authUser]);

    const userCanViewAdmin = (user: IUserData) => {
      return isAdmin({ data: user }) || isModerator({ data: user });
    };

    const noPadding =
      adminNoPadding ||
      pathname.includes('admin/dashboard') ||
      pathname.includes('admin/processing');

    const fullWidth =
      adminFullWidth === true ||
      endsWith(pathname, 'admin/moderation') ||
      pathname.includes('admin/dashboard') ||
      pathname.includes('admin/processing');
    const whiteBg =
      endsWith(pathname, 'admin/moderation') ||
      pathname.includes('admin/dashboard') ||
      pathname.includes('admin/processing');

    if (!isNilOrError(authUser) && userCanViewAdmin(authUser)) {
      return (
        <Container className={`${className} ${whiteBg ? 'whiteBg' : ''}`}>
          <Sidebar />
          <RightColumn
            className={`${fullWidth && 'fullWidth'} ${
              noPadding && 'noPadding'
            }`}
          >
            {children}
          </RightColumn>
        </Container>
      );
    }

    return null;
  }
);

export default withRouter<Props>(AdminPage);
