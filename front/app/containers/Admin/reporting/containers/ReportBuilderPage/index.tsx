import React, { useState } from 'react';

import { Box, Title, stylingConsts } from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';
import { useSearchParams } from 'react-router-dom';

import useAuthUser from 'api/me/useAuthUser';
import useReports from 'api/reports/useReports';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Tab from 'components/admin/NavigationTabs/Tab';
import Button from 'components/UI/Button';
import SearchInput from 'components/UI/SearchInput';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import CreateReportModal from '../../components/ReportBuilderPage/CreateReportModal';
import EmptyState from '../../components/ReportBuilderPage/EmptyState';
import ReportRow from '../../components/ReportBuilderPage/ReportRow';
import sharedMessages from '../../messages';

import messages from './messages';
import { compactObject, isEmpty } from './utils';

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

const tabNames = ['all-reports', 'your-reports', 'service-reports'];

const ReportBuilderPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState<string | undefined>();
  const [searchParams] = useSearchParams();
  const currentTab =
    tabNames.find((tab) => tab === searchParams.get('tab')) ?? 'all-reports';

  const { data: me } = useAuthUser();
  if (!me) return null;

  const reportParams = {
    search,
    owner_id: currentTab === 'your-reports' ? me.data.id : undefined,
    service: currentTab === 'service-reports' ? true : undefined,
  };
  const { data: reports } = useReports(reportParams);

  const isReportBuilderAllowed = useFeatureFlag({
    name: 'report_builder',
    onlyCheckAllowed: true,
  });

  const { formatMessage } = useIntl();

  if (!reports) return null;

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const showEmptyState =
    currentTab === 'all-reports' &&
    reports.data.length === 0 &&
    isEmpty(compactObject(reportParams));

  const searchReports = formatMessage(messages.searchReports);

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
            <Box
              background="white"
              mt="20px"
              border={stylingConsts.border}
              borderRadius={stylingConsts.borderRadius}
            >
              <Box
                display="flex"
                position="relative"
                borderRadius={stylingConsts.borderRadius}
                w="100%"
                pl="44px"
              >
                <Tab
                  label={formatMessage(messages.allReports)}
                  url={'/admin/reporting/report-builder'}
                  active={currentTab === 'all-reports'}
                />
                <Tab
                  label={formatMessage(messages.yourReports)}
                  url={`/admin/reporting/report-builder?tab=your-reports`}
                  active={currentTab === 'your-reports'}
                />
                <Tab
                  label={formatMessage(messages.serviceReports)}
                  url={`/admin/reporting/report-builder?tab=service-reports`}
                  active={currentTab === 'service-reports'}
                />
              </Box>
              <Box px="44px" py="24px">
                {reports.data.map((report) => (
                  <ReportRow key={report.id} report={report} />
                ))}
              </Box>
            </Box>
          </>
        )
      )}
      <CreateReportModal open={modalOpen} onClose={closeModal} />
    </>
  );
};

export default ReportBuilderPage;
