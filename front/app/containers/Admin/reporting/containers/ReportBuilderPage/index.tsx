import React, { useState } from 'react';

import {
  Box,
  colors,
  stylingConsts,
  Title,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import useAuthUser from 'api/me/useAuthUser';
import useReportBuilderEnabled from 'api/reports/useReportBuilderEnabled';
import useReports from 'api/reports/useReports';

import NavigationTabs from 'components/admin/NavigationTabs';
import Tab from 'components/admin/NavigationTabs/Tab';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import SearchInput from 'components/UI/SearchInput';
import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import CreateReportModal from '../../components/ReportBuilderPage/CreateReportModal';
import EmptyState from '../../components/ReportBuilderPage/EmptyState';
import ReportRow from '../../components/ReportBuilderPage/ReportRow';
import sharedMessages from '../../messages';

import messages from './messages';
import { getDefaultTab } from './utils';

const BuilderNotAllowedTooltip = ({ disabled, children }) => {
  const { formatMessage } = useIntl();

  return (
    <Tooltip
      disabled={disabled}
      placement="bottom"
      content={formatMessage(sharedMessages.contactToAccess)}
      hideOnClick
    >
      <Box>{children}</Box>
    </Tooltip>
  );
};

const TabContainer = ({ children }) => (
  <Box
    w="100%"
    borderBottom={`1px solid ${colors.divider}`}
    position="relative"
    zIndex="1"
    mb="-2px"
    overflow="hidden"
  >
    {children}
  </Box>
);

const ListContainer = ({ children }) => (
  <Box
    minHeight="66vh"
    px="36px"
    pb="36px"
    border={`1px solid ${colors.divider}`}
    borderRadius={stylingConsts.borderRadius}
    bg={colors.white}
  >
    {children}
  </Box>
);

const tabNames = [
  'all-reports',
  'your-reports',
  'service-reports',
  'community-monitor',
];

type ReportBuilderPageProps = {
  tabsToHide?: string[];
};

const ReportBuilderPage = ({ tabsToHide }: ReportBuilderPageProps) => {
  const { formatMessage } = useIntl();
  const [searchParams] = useSearchParams();
  const { data: me } = useAuthUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState<string | undefined>();

  const isReportBuilderAllowed = useReportBuilderEnabled({
    onlyCheckAllowed: true,
  });

  // Compute the query parameters for the reports API based on the tab.
  function getParams(tab: string) {
    return {
      search,
      owner_id: tab === 'your-reports' ? me?.data.id : undefined,
      service: tab === 'service-reports' ? true : undefined,
      community_monitor: tab === 'community-monitor' ? true : undefined,
    };
  }

  const { data: yourReports, isLoading: isLoadingYourRpts } = useReports(getParams('your-reports')); // prettier-ignore
  const { data: serviceReports, isLoading: isLoadingServiceRpts } = useReports(getParams('service-reports')); // prettier-ignore
  const { data: allReports, isLoading: isLoadingAllRpts } = useReports(getParams('all-reports')); // prettier-ignore
  const { data: communityMonitorReports, isLoading: isLoadingCommunityMonitorRpts } = useReports(getParams('community-monitor')); // prettier-ignore

  if (
    isLoadingYourRpts ||
    isLoadingServiceRpts ||
    isLoadingAllRpts ||
    isLoadingCommunityMonitorRpts
  ) {
    return null;
  }

  const defaultTab = getDefaultTab(me);

  const currentTab =
    tabNames.find((tab) => tab === searchParams.get('tab')) ?? defaultTab;

  const reports = {
    'your-reports': yourReports,
    'service-reports': serviceReports,
    'community-monitor': communityMonitorReports,
    'all-reports': allReports,
  }[currentTab];

  if (!reports) return null;
  if (!me) return null;

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const sortedReports = reports?.data.sort((a, b) => {
    return b.attributes.updated_at.localeCompare(a.attributes.updated_at);
  });

  const allReportsCount = allReports?.data.length ?? 0;
  const yourReportsCount = yourReports?.data.length ?? 0;
  const serviceReportsCount = serviceReports?.data.length ?? 0;
  const communityMonitorReportsCount =
    communityMonitorReports?.data.length ?? 0;

  const showServiceReportsTab =
    isAdmin(me) &&
    serviceReportsCount > 0 &&
    !tabsToHide?.includes('service-reports');

  const showCommunityMonitorReportsTab =
    isAdmin(me) &&
    communityMonitorReportsCount > 0 &&
    !tabsToHide?.includes('community-monitor');

  const showEmptyState =
    currentTab === defaultTab &&
    reports.data.length === 0 &&
    search === undefined;

  const searchReports = formatMessage(messages.searchReports);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const noReportMessage = (() => {
    if (search) return null;
    if (sortedReports.length > 0) return null;
    if (currentTab !== 'your-reports') return null;

    return formatMessage(messages.personalReportsPlaceholder);
  })();

  return (
    <>
      <Box display="flex" justifyContent="space-between" mb="24px">
        <Title variant="h1" color="primary">
          <FormattedMessage {...sharedMessages.reportBuilder} />
        </Title>

        {!showEmptyState && (
          <Box display="flex" alignItems="center">
            <BuilderNotAllowedTooltip disabled={isReportBuilderAllowed}>
              <ButtonWithLink
                onClick={openModal}
                icon="plus-circle"
                buttonStyle="admin-dark"
                disabled={!isReportBuilderAllowed}
                data-cy="e2e-create-report-button"
              >
                <FormattedMessage {...messages.createAReport} />
              </ButtonWithLink>
            </BuilderNotAllowedTooltip>
          </Box>
        )}
      </Box>

      {showEmptyState ? (
        <EmptyState onOpenModal={openModal} />
      ) : (
        isReportBuilderAllowed && (
          <>
            <Box my="24px" w="fit-content">
              <SearchInput
                placeholder={searchReports}
                ariaLabel={searchReports}
                // TODO: Fix this the next time the file is edited.
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                a11y_numberOfSearchResults={reports?.data.length ?? 0}
                onChange={(value) => setSearch(value ?? undefined)}
              />
            </Box>

            <Box>
              <TabContainer>
                <NavigationTabs position="relative">
                  {!tabsToHide?.includes('your-reports') && (
                    <Tab
                      label={`${formatMessage(
                        messages.yourReports
                      )} (${yourReportsCount})`}
                      url={`/admin/reporting/report-builder?tab=your-reports`}
                      active={currentTab === 'your-reports'}
                    />
                  )}

                  {isAdmin(me) && !tabsToHide?.includes('all-reports') && (
                    <Tab
                      label={`${formatMessage(
                        messages.allReports
                      )} (${allReportsCount})`}
                      url={'/admin/reporting/report-builder'}
                      active={currentTab === 'all-reports'}
                    />
                  )}

                  {showServiceReportsTab && (
                    <Tooltip
                      content={formatMessage(messages.serviceReportsTooltip)}
                      placement="top-start"
                      delay={500}
                    >
                      <div>
                        <Tab
                          label={`${formatMessage(
                            messages.serviceReports
                          )} (${serviceReportsCount})`}
                          url={`/admin/reporting/report-builder?tab=service-reports`}
                          active={currentTab === 'service-reports'}
                        />
                      </div>
                    </Tooltip>
                  )}
                  {showCommunityMonitorReportsTab && (
                    <Tooltip
                      content={formatMessage(
                        messages.communityMonitorReportsTooltip
                      )}
                      placement="top-start"
                      delay={500}
                    >
                      <div>
                        <Tab
                          label={`${formatMessage(
                            messages.communityMonitorReports
                          )} (${communityMonitorReportsCount})`}
                          url={`/admin/reporting/report-builder?tab=community-monitor`}
                          active={currentTab === 'community-monitor'}
                        />
                      </div>
                    </Tooltip>
                  )}
                </NavigationTabs>
              </TabContainer>

              <ListContainer>
                {noReportMessage && (
                  <Box py="16px">
                    <Warning>{noReportMessage}</Warning>
                  </Box>
                )}

                {sortedReports.map((report) => (
                  <ReportRow key={report.id} report={report} />
                ))}
              </ListContainer>
            </Box>
          </>
        )
      )}
      <CreateReportModal open={modalOpen} onClose={closeModal} />
    </>
  );
};

export default ReportBuilderPage;
