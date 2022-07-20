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
import styled, { ThemeProvider } from 'styled-components';
import { colors, media } from 'utils/styleUtils';

// utils
import clHistory from 'utils/cl-router/history';
import { endsWith } from 'utils/helperUtils';

// stlying
import 'assets/semantic/semantic.min.css';
import { rgba } from 'polished';

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

export const chartTheme = (theme) => {
  return {
    ...theme,
    chartStroke: colors.clIconAccent,
    chartStrokeGreen: colors.clGreen,
    chartStrokeRed: colors.red500,
    chartFill: colors.clIconAccent,
    barFill: colors.adminContentBackground,
    chartLabelColor: colors.adminSecondaryTextColor,
    barHoverColor: rgba(colors.clIconAccent, 0.25),
    chartLabelSize: 13,
    animationBegin: 10,
    animationDuration: 200,
    cartesianGridColor: '#f5f5f5',
    newBarFill: '#073F80',
    newLineColor: '#7FBBCA',
    barSize: 20,
  };
};

type Props = {
  className?: string;
};

const AdminPage = memo<Props & WithRouterProps>(
  ({ className, location: { pathname } }) => {
    const authUser = useAuthUser();

    const [adminFullWidth, setAdminFullWidth] = useState(false);
    const [adminNoPadding, setAdminNoPadding] = useState(false);

    const userCanViewAdmin = usePermission({
      item: { type: 'route', path: '/admin' },
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
      if (authUser === null || (authUser !== undefined && !userCanViewAdmin)) {
        clHistory.push('/');
      }
    }, [authUser, userCanViewAdmin]);

    if (!userCanViewAdmin) {
      return null;
    }

    const noPadding =
      adminNoPadding ||
      pathname.includes('admin/dashboard') ||
      pathname.includes('admin/insights');

    const fullWidth =
      adminFullWidth === true ||
      endsWith(pathname, 'admin/moderation') ||
      pathname.includes('admin/dashboard') ||
      pathname.includes('admin/insights');

    const whiteBg = endsWith(pathname, 'admin/moderation');

    return (
      <HasPermission
        item={{ type: 'route', path: '/admin/dashboard' }}
        action="access"
      >
        <ThemeProvider theme={chartTheme}>
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
        </ThemeProvider>
      </HasPermission>
    );
  }
);

export default withRouter(AdminPage);
