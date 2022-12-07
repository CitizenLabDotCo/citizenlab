import React from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import { SectionTitle } from 'components/admin/Section';
import EmptyState from '../../components/ReportBuilderPage/EmptyState';
import PageWrapper from 'components/admin/PageWrapper';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

const ReportBuilder = () => {
  const reportBuilderEnabled = useFeatureFlag({ name: 'report_builder' });
  if (!reportBuilderEnabled) return null;

  const showEmptyState = true;

  return (
    <>
      <SectionTitle>
        <FormattedMessage {...messages.reportCreator} />
      </SectionTitle>
      {showEmptyState ? <EmptyState /> : <PageWrapper>Content</PageWrapper>}
    </>
  );
};

export default ReportBuilder;
