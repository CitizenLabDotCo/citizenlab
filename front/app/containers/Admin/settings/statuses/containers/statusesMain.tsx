import React, { useEffect, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useLocation, Outlet } from 'react-router-dom';

import { Tab } from 'components/admin/NavigationTabs';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
const StatusesComponent = React.lazy(() => import('./index'));

type StatusType = 'ideation' | 'proposals';

const StatusesMain = () => {
  const { formatMessage } = useIntl();
  const location = useLocation();
  const pathname = location.pathname;
  const isMainPage =
    pathname.endsWith('/ideation') ||
    pathname.endsWith('/proposals') ||
    pathname.endsWith('/statuses');

  const [selectedStatusType, setSelectedStatusType] =
    useState<StatusType>('ideation');

  useEffect(() => {
    const isProposals = pathname.includes('/proposals');

    setSelectedStatusType(isProposals ? 'proposals' : 'ideation');
  }, [pathname]);

  return (
    <>
      {isMainPage && (
        <Box display="flex" mb="30px">
          <Tab
            label={formatMessage(messages.tabInputStatuses)}
            url={'/admin/settings/statuses/ideation'}
            active={selectedStatusType === 'ideation'}
          />
          <Tab
            label={formatMessage(messages.tabProposalStatuses1)}
            url={'/admin/settings/statuses/proposals'}
            active={selectedStatusType === 'proposals'}
          />
        </Box>
      )}

      {isMainPage ? (
        <StatusesComponent variant={selectedStatusType} />
      ) : (
        <Outlet />
      )}
    </>
  );
};

export default StatusesMain;
