import React, { useState } from 'react';

import {
  colors,
  Box,
  Title,
  Text,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import Tippy from '@tippyjs/react';

import useReports from 'api/reports/useReports';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';

import CreateReportModal from '../../components/ReportBuilderPage/CreateReportModal';
import EmptyState from '../../components/ReportBuilderPage/EmptyState';
import ReportRow from '../../components/ReportBuilderPage/ReportRow';
import sharedMessages from '../../messages';

import messages from './messages';

const ReportBuilderPage = () => {
  const { data: reports } = useReports();
  const [modalOpen, setModalOpen] = useState(false);
  const isReportBuilderAllowed = useFeatureFlag({
    name: 'report_builder',
    onlyCheckAllowed: true,
  });

  if (!reports) {
    return null;
  }

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const showEmptyState = reports.data.length === 0;

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
            <Box
              background="white"
              px="56px"
              py="40px"
              mt="20px"
              border={stylingConsts.border}
              borderRadius={stylingConsts.borderRadius}
            >
              <Title
                variant="h3"
                as="h2"
                color="primary"
                mt="0px"
                mb="32px"
                fontWeight="normal"
              >
                <FormattedMessage {...messages.viewReports} />
              </Title>
              {reports.data.map((report) => (
                <ReportRow key={report.id} report={report} />
              ))}
            </Box>
          )}
        </>
      )}
      <CreateReportModal open={modalOpen} onClose={closeModal} />
    </>
  );
};

export default ReportBuilderPage;
