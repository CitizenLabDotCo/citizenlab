import React, { useState } from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import { SectionTitle } from 'components/admin/Section';
import EmptyState from '../../components/ReportBuilderPage/EmptyState';
import PageWrapper from 'components/admin/PageWrapper';
import CreateReportModal from '../../components/ReportBuilderPage/CreateReportModal';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

const ReportBuilder = () => {
  const reportBuilderEnabled = useFeatureFlag({ name: 'report_builder' });
  const [modalOpen, setModalOpen] = useState(false);

  if (!reportBuilderEnabled) return null;

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const showEmptyState = true;

  return (
    <>
      <SectionTitle>
        <FormattedMessage {...messages.reportCreator} />
      </SectionTitle>
      {showEmptyState ? (
        <EmptyState onOpenModal={openModal} />
      ) : (
        <PageWrapper>Content</PageWrapper>
      )}
      <CreateReportModal open={modalOpen} onClose={closeModal} />
    </>
  );
};

export default ReportBuilder;
