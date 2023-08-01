import React from 'react';

import {
  Icon,
  colors,
  Text,
  Title,
  Box,
} from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
// import { useIntl } from 'utils/cl-intl';
// import messages from './messages';
import { useParams } from 'react-router-dom';

const AnalysisBanner = () => {
  const { projectId } = useParams() as { projectId: string };
  // const { formatMessage } = useIntl();

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      borderColor={colors.borderLight}
      borderRadius="3px"
      borderWidth="1px"
      borderStyle="solid"
      p="8px 16px"
      mb="36px"
    >
      <Box display="flex" gap="16px" alignItems="center">
        <Icon name="pen" width="50px" height="50px" fill={colors.green700} />
        <Box>
          <Title variant="h3">Written ideas import</Title>
          <Text>
            Automatically import ideas written down on paper using the written
            ideas importer!
          </Text>
        </Box>
      </Box>
      <Button
        buttonStyle="admin-dark"
        linkTo={`/admin/projects/${projectId}/ideas/written-ideas-import`}
      >
        Go to importer
      </Button>
    </Box>
  );
};

export default AnalysisBanner;
