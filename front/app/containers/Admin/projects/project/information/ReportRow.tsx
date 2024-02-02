import React from 'react';

// components
import { ListItem, Box, Title } from '@citizenlab/cl2-component-library';
import ReportRowEditedText from 'containers/Admin/reporting/components/ReportBuilderPage/ReportRow/EditedText';
import ReportRowButtons from 'containers/Admin/reporting/components/ReportBuilderPage/ReportRow/Buttons';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// utils
import clHistory from 'utils/cl-router/history';

import useDeleteReport from 'api/reports/useDeleteReport';
import { Report } from 'api/reports/types';

interface Props {
  report: Report;
}

const ReportRow = ({ report }: Props) => {
  const { mutate: deleteReport, isLoading } = useDeleteReport();
  const { formatMessage } = useIntl();

  const handleDeleteReport = async () => {
    if (window.confirm(formatMessage(messages.areYouSureYouWantToDelete))) {
      deleteReport(report.id);
    }
  };

  const reportPath = `/admin/reporting/report-builder/${report.id}`;

  const handleEditReport = () => {
    clHistory.push(`${reportPath}/editor`);
  };

  return (
    <ListItem>
      <Box
        width="100%"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        py="12px"
      >
        <Box>
          <Title variant="h5" color="primary" mt="0px" mb="0px">
            {formatMessage(messages.report)}
          </Title>
          <ReportRowEditedText
            createdAt={report.attributes.created_at}
            updatedAt={report.attributes.updated_at}
            userId={report.relationships.owner.data.id}
          />
        </Box>
        <ReportRowButtons
          reportId={report.id}
          isLoading={isLoading}
          onDelete={handleDeleteReport}
          onEdit={handleEditReport}
        />
      </Box>
    </ListItem>
  );
};

export default ReportRow;
