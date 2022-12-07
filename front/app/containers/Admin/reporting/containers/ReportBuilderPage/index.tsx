import React, { useState } from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
import useReports from 'hooks/useReports';

// components
import { SectionTitle } from 'components/admin/Section';
import EmptyState from '../../components/ReportBuilderPage/EmptyState';
import PageWrapper from 'components/admin/PageWrapper';
import { Text } from '@citizenlab/cl2-component-library';
import CreateReportModal from '../../components/ReportBuilderPage/CreateReportModal';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import sharedMessages from '../../messages';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

const ReportBuilder = () => {
  const reportBuilderEnabled = useFeatureFlag({ name: 'report_builder' });
  const reports = useReports();
  const [modalOpen, setModalOpen] = useState(false);

  if (!reportBuilderEnabled || isNilOrError(reports)) {
    return null;
  }

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const showEmptyState = reports.length === 0;

  return (
    <>
      <SectionTitle>
        <FormattedMessage {...sharedMessages.reportCreator} />
      </SectionTitle>
      {showEmptyState ? (
        <EmptyState onOpenModal={openModal} />
      ) : (
        <PageWrapper>
          <Text fontSize="l" color="primary">
            <FormattedMessage {...messages.viewReports} />
          </Text>
        </PageWrapper>
      )}
      <CreateReportModal open={modalOpen} onClose={closeModal} />
    </>
  );
};

export default ReportBuilder;
