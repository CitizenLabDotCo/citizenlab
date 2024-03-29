import React from 'react';

import { ListItem, Box, Title } from '@citizenlab/cl2-component-library';

import { Report } from 'api/reports/types';
import useDeleteReport from 'api/reports/useDeleteReport';

import { useIntl } from 'utils/cl-intl';

import Buttons from './Buttons';
import EditedText from './EditedText';
import messages from './messages';

interface Props {
  report: Report;
}

const ReportRow = ({ report }: Props) => {
  const { mutate: deleteReport, isLoading } = useDeleteReport();
  const { formatMessage } = useIntl();

  const handleDeleteReport = async () => {
    const reportName = report.attributes.name;
    if (
      window.confirm(
        reportName
          ? formatMessage(messages.confirmDeleteReport, {
              reportName,
            })
          : formatMessage(messages.confirmDeleteThisReport)
      )
    ) {
      deleteReport(report.id);
    }
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
            {report.attributes.name}
          </Title>
          <EditedText
            createdAt={report.attributes.created_at}
            updatedAt={report.attributes.updated_at}
            userId={report.relationships.owner?.data?.id}
          />
        </Box>
        <Box display="flex">
          <Buttons
            reportId={report.id}
            isLoading={isLoading}
            onDelete={handleDeleteReport}
          />
        </Box>
      </Box>
    </ListItem>
  );
};

export default ReportRow;
