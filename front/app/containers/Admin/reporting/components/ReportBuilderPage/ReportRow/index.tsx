import React from 'react';

import { ListItem, Box, Title } from '@citizenlab/cl2-component-library';

import { Report } from 'api/reports/types';

import Buttons from './Buttons';
import EditedText from './EditedText';

interface Props {
  report: Report;
}

const ReportRow = ({ report }: Props) => {
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
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            userId={report.relationships.owner?.data?.id}
          />
        </Box>
        <Box display="flex">
          <Buttons reportId={report.id} />
        </Box>
      </Box>
    </ListItem>
  );
};

export default ReportRow;
