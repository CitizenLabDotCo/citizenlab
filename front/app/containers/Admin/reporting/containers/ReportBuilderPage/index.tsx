import React, { useState } from 'react';

import {
  colors,
  Box,
  Title,
  Text,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
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

const ReportBuilderPage = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState<string | undefined>();
  const [searchParams] = useSearchParams();
  const globalReportsActve = searchParams.get('tab') === 'global-reports';
  const { data: me } = useAuthUser();

  const { data: reports } = useReports({
    search,
    owner_id: globalReportsActve ? undefined : me?.data.id,
  });
  const isReportBuilderAllowed = useFeatureFlag({
    name: 'report_builder',
    onlyCheckAllowed: true,
  });

  const { formatMessage } = useIntl();

  if (!reports) {
    return null;
  }

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const showEmptyState = reports.data.length === 0;

  const searchReports = formatMessage(messages.searchReports);

  return (
    <>
      <Title variant="h1" color="primary" mb="32px">
        <FormattedMessage {...sharedMessages.reportBuilder} />
      </Title>
      {showEmptyState ? (
        <EmptyState onOpenModal={openModal} />
      ) : (
        <>
          <Box
            background="white"
            px="56px"
            py="40px"
            border={stylingConsts.border}
            borderRadius={stylingConsts.borderRadius}
          >
            <Title
              variant="h3"
              as="h2"
              color="primary"
              mt="0px"
              mb="0px"
              fontWeight="normal"
            >
              <FormattedMessage {...messages.createAReport} />
            </Title>
            <Text color="textSecondary" mt="4px" mb="16px">
              <FormattedMessage {...messages.createReportDescription} />
            </Text>
            <Box display="flex">
              <Tippy
                maxWidth="250px"
                placement="right-start"
                content={
                  <FormattedMessage {...sharedMessages.contactToAccess} />
                }
                disabled={isReportBuilderAllowed}
                hideOnClick
              >
                <div>
                  <Button
                    onClick={openModal}
                    width="auto"
                    mt="12px"
                    bgColor={colors.primary}
                    disabled={!isReportBuilderAllowed}
                    p="8px 12px"
                  >
                    <FormattedMessage {...messages.createAReport} />
                  </Button>
                </div>
              </Tippy>
            </Box>
          </Box>
          {isReportBuilderAllowed && (
            <>
              <Box mt="40px" w="300px">
                <SearchInput
                  placeholder={searchReports}
                  ariaLabel={searchReports}
                  a11y_numberOfSearchResults={reports?.data.length ?? 0}
                  onChange={(value) => {
                    setSearch(value ?? undefined);
                  }}
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
                    label={formatMessage(messages.yourReports)}
                    url={'/admin/reporting/report-builder'}
                    active={!globalReportsActve}
                  />
                  <Tab
                    label={formatMessage(messages.globalReports)}
                    url={`/admin/reporting/report-builder?tab=global-reports`}
                    active={globalReportsActve}
                  />
                </Box>
                <Box px="44px" py="24px">
                  {reports.data.map((report) => (
                    <ReportRow key={report.id} report={report} />
                  ))}
                </Box>
              </Box>
            </>
          )}
        </>
      )}
      <CreateReportModal open={modalOpen} onClose={closeModal} />
    </>
  );
};

export default ReportBuilderPage;
