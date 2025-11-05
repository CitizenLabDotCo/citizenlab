import React, { useState } from 'react';

import { Box, Title, IconButton, Text, Toggle } from 'component-library';
import { useParams } from 'react-router-dom';

import useDemographics from 'api/phase_insights/useDemographics';
import usePhase from 'api/phases/usePhase';

import { FormattedMessage } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../messages';

import QuestionCard from './QuestionCard';

const AdminPhaseAudience = () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const { data: phase } = usePhase(phaseId);
  const [showRepresentativeness, setShowRepresentativeness] = useState(true);

  const { data: demographicsData } = useDemographics({
    phaseId: phase?.data.id || '',
    userDataCollection:
      phase?.data.attributes.user_data_collection || 'anonymous',
  });

  const allFields = demographicsData?.fields || [];

  if (!phase) {
    return null;
  }

  return (
    <Box
      background="white"
      borderBottom="none"
      display="flex"
      flexDirection="column"
      gap="24px"
    >
      <Box
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box display="flex" gap="8px" alignItems="center">
          <IconButton
            iconName="arrow-left"
            a11y_buttonActionMessage="Back to insights"
            onClick={() =>
              clHistory.push(
                `/admin/projects/${projectId}/phases/${phase.data.id}/insights`
              )
            }
            iconColor="#43515d"
            iconColorOnHover="#43515d"
          />
          <Title variant="h2" as="h1" color="textPrimary" m="0px">
            <FormattedMessage {...messages.audienceTitle} />
          </Title>
        </Box>

        <Box display="flex" gap="8px" alignItems="center">
          <Toggle
            checked={showRepresentativeness}
            onChange={() => setShowRepresentativeness(!showRepresentativeness)}
          />
          <Text
            fontSize="s"
            fontWeight="semi-bold"
            color="textSecondary"
            m="0px"
          >
            <FormattedMessage {...messages.communityRepresentativeness} />
          </Text>
        </Box>
      </Box>

      <Box
        pt="16px"
        display="flex"
        flexWrap="wrap"
        gap="60px"
        alignContent="flex-start"
      >
        {allFields.map((field) => (
          <QuestionCard
            key={field.field_id}
            field={field}
            showRepresentativeness={showRepresentativeness}
          />
        ))}
      </Box>
    </Box>
  );
};

export default AdminPhaseAudience;
