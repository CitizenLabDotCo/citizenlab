import React, { useState } from 'react';

import {
  Box,
  colors,
  stylingConsts,
  Title,
} from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';
import { useSearchParams } from 'react-router-dom';

import useAuthUser from 'api/me/useAuthUser';
import useReports from 'api/reports/useReports';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Button from 'components/UI/Button';
import NavigationTabs from 'components/admin/NavigationTabs';
import SearchInput from 'components/UI/SearchInput';
import Tab from 'components/admin/NavigationTabs/Tab';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import CreateReportModal from '../../components/ReportBuilderPage/CreateReportModal';
import EmptyState from '../../components/ReportBuilderPage/EmptyState';
import ReportRow from '../../components/ReportBuilderPage/ReportRow';
import Warning from 'components/UI/Warning';

import sharedMessages from '../../messages';
import messages from './messages';

const BuilderNotAllowedTooltip = ({ disabled, children }) => {
  const { formatMessage } = useIntl();

  return (
    <Tippy
      disabled={disabled}
      placement="bottom"
      content={formatMessage(sharedMessages.contactToAccess)}
      hideOnClick
    >
      <Box>{children}</Box>
    </Tippy>
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

const tabNames = ['all-reports', 'your-reports', 'service-reports'];

const ReportBuilderPage = () => {
  const { formatMessage } = useIntl();
  const [searchParams] = useSearchParams();
  const { data: me } = useAuthUser();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState<string | undefined>();

  const isReportBuilderAllowed = useFeatureFlag({
    name: 'report_builder',
    onlyCheckAllowed: true,
  });

  // Compute the query parameters for the reports API based on the tab.
  function getParams(tab: string) {
    return {
      search,
      owner_id: tab === 'your-reports' ? me?.data.id : undefined,
      service: tab === 'service-reports' ? true : undefined,
    };
  }

  const { data: yourReports, isLoading: isLoadingYourRpts } = useReports(getParams('your-reports')); // prettier-ignore
  const { data: serviceReports, isLoading: isLoadingServiceRpts} = useReports(getParams('service-reports')); // prettier-ignore
  const { data: allReports, isLoading: isLoadingAllRpts } = useReports(getParams('all-reports')); // prettier-ignore

  if (isLoadingYourRpts || isLoadingServiceRpts || isLoadingAllRpts)
    return null;

  const defaultTab = isAdmin(me) ? 'all-reports' : 'your-reports';
  const currentTab =
    tabNames.find((tab) => tab === searchParams.get('tab')) ?? defaultTab;

  const reports = {
    'your-reports': yourReports,
    'service-reports': serviceReports,
    'all-reports': allReports,
  }[currentTab];

  if (!reports) return null;
  if (!me) return null;

  const sortedReports = reports?.data.sort((a, b) => {
    return b.attributes.updated_at.localeCompare(a.attributes.updated_at);
  });

  const allReportsCount = allReports?.data.length ?? 0;
  const yourReportsCount = yourReports?.data.length ?? 0;
  const serviceReportsCount = serviceReports?.data.length ?? 0;

  const showServiceReportsTab = isAdmin(me) && serviceReportsCount > 0;

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
              <Button
                onClick={openModal}
                icon="plus-circle"
                buttonStyle="admin-dark"
                disabled={!isReportBuilderAllowed}
              >
                <FormattedMessage {...messages.createAReport} />
              </Button>
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
                a11y_numberOfSearchResults={reports?.data.length ?? 0}
                onChange={(value) => setSearch(value ?? undefined)}
              />
            </Box>

            <Box>
              <TabContainer>
                <NavigationTabs position="relative">
                  {isAdmin(me) && (
                    <Tab
                      label={`${formatMessage(
                        messages.allReports
                      )} (${allReportsCount})`}
                      url={'/admin/reporting/report-builder'}
                      active={currentTab === 'all-reports'}
                    />
                  )}

                  <Tab
                    label={`${formatMessage(
                      messages.yourReports
                    )} (${yourReportsCount})`}
                    url={`/admin/reporting/report-builder?tab=your-reports`}
                    active={currentTab === 'your-reports'}
                  />

                  {showServiceReportsTab && (
                    <Tab
                      label={`${formatMessage(
                        messages.progressReports
                      )} (${serviceReportsCount})`}
                      url={`/admin/reporting/report-builder?tab=service-reports`}
                      active={currentTab === 'service-reports'}
                    />
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
