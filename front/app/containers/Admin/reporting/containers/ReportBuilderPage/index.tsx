import React, { useState } from 'react';

// hooks
import useReports from 'hooks/useReports';

// styling
import { colors } from 'utils/styleUtils';

// components
import EmptyState from '../../components/ReportBuilderPage/EmptyState';
import { Box, Title, Text } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import ReportRow from '../../components/ReportBuilderPage/ReportRow';
import CreateReportModal from '../../components/ReportBuilderPage/CreateReportModal';
import Tippy from '@tippyjs/react';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import sharedMessages from '../../messages';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

const ReportBuilderPage = () => {
  const reports = useReports();
  const [modalOpen, setModalOpen] = useState(false);
  const isReportBuilderAllowed = useFeatureFlag({
    name: 'report_builder',
    onlyCheckAllowed: true,
  });

  if (isNilOrError(reports)) {
    return null;
  }

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const showEmptyState = reports.length === 0;

  return (
    <>
      <Title variant="h1" color="primary" mt="0px" mb="32px">
        <FormattedMessage {...sharedMessages.reportBuilder} />
      </Title>
      {showEmptyState ? (
        <EmptyState onOpenModal={openModal} />
      ) : (
        <>
          <Box background="white" px="56px" py="40px">
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
            <Text color="textSecondary" mt="4px" mb="0px">
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
                    p="8px 12px"
                  >
                    <FormattedMessage {...messages.createAReport} />
                  </Button>
                </div>
              </Tippy>
            </Box>
          </Box>
          <Box background="white" px="56px" py="40px" mt="20px">
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
            {reports.map((report) => (
              <ReportRow key={report.id} report={report} />
            ))}
          </Box>
        </>
      )}
      <CreateReportModal open={modalOpen} onClose={closeModal} />
    </>
  );
};

export default ReportBuilderPage;
