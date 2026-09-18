import React, { useState } from 'react';

import {
  Box,
  Spinner,
  Text,
  Title,
  colors,
} from '@citizenlab/cl2-component-library';

import { OpinionGroupsParameters } from 'api/opinion_groups/types';
import useOpinionGroups from 'api/opinion_groups/useOpinionGroups';

import { FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import Controls, { ColorBy } from './Controls';
import GroupCard from './GroupCard';
import messages from './messages';
import OpinionMap from './OpinionMap';
import ParticipationBalance from './ParticipationBalance';
import StatementLists from './StatementLists';
import StatementsTable from './StatementsTable';
import StatsRow from './StatsRow';
import { hasEnoughData } from './utils';

const DEFAULT_PARAMETERS: OpinionGroupsParameters = {
  include_demographics: false,
  demographic_weight: 0.5,
  min_votes_per_participant: 3,
};

const OpinionGroups = () => {
  const { phaseId } = useParams({ strict: false });
  const [parameters, setParameters] =
    useState<OpinionGroupsParameters>(DEFAULT_PARAMETERS);
  const [colorBy, setColorBy] = useState<ColorBy>({ type: 'group' });

  const { data, isLoading, isFetching, isError } = useOpinionGroups(
    phaseId,
    parameters
  );

  const attributes = data?.data.attributes;

  return (
    <Box display="flex" flexDirection="column" gap="24px">
      <Box>
        <Title variant="h2" as="h1" color="textPrimary" m="0px">
          <FormattedMessage {...messages.title} />
        </Title>
        <Text fontSize="s" color="textSecondary" m="0" mt="4px">
          <FormattedMessage {...messages.subtitle} />
        </Text>
      </Box>

      <Controls
        parameters={parameters}
        onChangeParameters={setParameters}
        colorBy={colorBy}
        onChangeColorBy={setColorBy}
        demographicFields={attributes?.demographic_fields ?? []}
      />

      {isLoading && (
        <Box display="flex" alignItems="center" gap="12px" py="40px">
          <Spinner />
          <Text m="0" color="textSecondary">
            <FormattedMessage {...messages.loading} />
          </Text>
        </Box>
      )}

      {isError && (
        <Text color="error">
          <FormattedMessage {...messages.error} />
        </Text>
      )}

      {attributes && !hasEnoughData(attributes) && (
        <Box p="24px" bgColor={colors.grey100} borderRadius="3px">
          <Text m="0" color="textSecondary">
            <FormattedMessage {...messages.notEnoughData} />
          </Text>
        </Box>
      )}

      {attributes && hasEnoughData(attributes) && (
        // Keep the previous result visible while a new one is computed.
        <Box
          display="flex"
          flexDirection="column"
          gap="32px"
          opacity={isFetching ? 0.5 : 1}
        >
          <StatsRow attributes={attributes} />

          <OpinionMap attributes={attributes} colorBy={colorBy} />

          <Box
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            }}
            gap="16px"
          >
            {attributes.groups.map((group) => (
              <GroupCard key={group.id} group={group} attributes={attributes} />
            ))}
          </Box>

          <Text fontSize="s" color="textSecondary" m="0">
            <FormattedMessage
              {...messages.privacyNote}
              values={{ threshold: attributes.parameters.privacy_threshold }}
            />
          </Text>

          <StatementLists attributes={attributes} />

          <StatementsTable attributes={attributes} />

          <ParticipationBalance attributes={attributes} />
        </Box>
      )}
    </Box>
  );
};

export default OpinionGroups;
