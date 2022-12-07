import React from 'react';

// services
import { deleteReport, Report } from 'services/reports';

// components
import { ListItem, Box, Title } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';

// utils
import clHistory from 'utils/cl-router/history';

interface Props {
  report: Report;
}

const ReportRow = ({ report }: Props) => {
  const handleDeleteReport = () => {
    deleteReport(report.id);
  };

  const handleEditReport = () => {
    clHistory.push(`/admin/reporting/report-creator/${report.id}`);
  };

  const handleViewReport = () => {
    // TODO
  };

  return (
    <ListItem>
      <Box
        width="100%"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        py="8px"
      >
        <Title variant="h5" color="primary" mt="0px" mb="0px">
          {report.attributes.name}
        </Title>
        <Box display="flex">
          <Button
            mr="8px"
            icon="delete"
            buttonStyle="white"
            onClick={handleDeleteReport}
          >
            Delete
          </Button>
          <Button
            mr="8px"
            icon="edit"
            buttonStyle="secondary"
            onClick={handleEditReport}
          >
            Edit
          </Button>
          <Button icon="eye" buttonStyle="secondary" onClick={handleViewReport}>
            View
          </Button>
        </Box>
      </Box>
    </ListItem>
  );
};

export default ReportRow;
