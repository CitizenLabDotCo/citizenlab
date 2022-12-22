import React, { useState } from 'react';

// services
import { deleteReport, Report } from 'services/reports';

// components
import { ListItem, Box, Title } from '@citizenlab/cl2-component-library';
import EditedText from './EditedText';
import Button from 'components/UI/Button';

// styling

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// utils
import clHistory from 'utils/cl-router/history';
import ShareReportButton from './ShareReportButton';

interface Props {
  report: Report;
}

const ReportRow = ({ report }: Props) => {
  const { formatMessage } = useIntl();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteReport = async () => {
    setDeleting(true);

    if (
      window.confirm(
        formatMessage(messages.confirmDeleteReport, {
          reportName: report.attributes.name,
        })
      )
    ) {
      await deleteReport(report.id);
    }

    setDeleting(false);
  };

  const reportPath = `/admin/reporting/report-builder/${report.id}`;

  const handleEditReport = () => {
    clHistory.push(`${reportPath}/editor`);
  };

  const handleViewReport = () => {
    clHistory.push(`${reportPath}/viewer`);
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
            userId={report.relationships.owner.data.id}
          />
        </Box>
        <Box display="flex">
          <Button
            mr="8px"
            icon="delete"
            buttonStyle="white"
            onClick={handleDeleteReport}
            processing={deleting}
            disabled={deleting}
            iconSize="18px"
          >
            {formatMessage(messages.delete)}
          </Button>
          <Button
            mr="8px"
            icon="edit"
            buttonStyle="secondary"
            onClick={handleEditReport}
            disabled={deleting}
            iconSize="18px"
          >
            {formatMessage(messages.edit)}
          </Button>
          <Button
            mr="8px"
            icon="eye"
            buttonStyle="secondary"
            onClick={handleViewReport}
            disabled={deleting}
            iconSize="18px"
          >
            {formatMessage(messages.view)}
          </Button>
          <ShareReportButton reportId={report.id} buttonStyle="primary" />
        </Box>
      </Box>
    </ListItem>
  );
};

export default ReportRow;
