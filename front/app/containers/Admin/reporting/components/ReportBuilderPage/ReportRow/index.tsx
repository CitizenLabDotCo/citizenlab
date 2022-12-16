import React, { useState } from 'react';

// services
import { deleteReport, Report } from 'services/reports';

// components
import { ListItem, Box, Title } from '@citizenlab/cl2-component-library';
import EditedText from './EditedText';
import Button from 'components/UI/Button';

// styling
import { colors } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// utils
import clHistory from 'utils/cl-router/history';

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

  const handleEditReport = () => {
    clHistory.push(`/admin/reporting/report-builder/${report.id}/editor`);
  };

  const handleViewReport = () => {
    clHistory.push(`/admin/reporting/report-builder/${report.id}/viewer`);
  };

  const handleShareReport = () => {
    // TODO
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
          <Button
            icon="share"
            bgColor={colors.teal500}
            onClick={handleShareReport}
            disabled={deleting}
            iconSize="18px"
          >
            {formatMessage(messages.share)}
          </Button>
        </Box>
      </Box>
    </ListItem>
  );
};

export default ReportRow;
