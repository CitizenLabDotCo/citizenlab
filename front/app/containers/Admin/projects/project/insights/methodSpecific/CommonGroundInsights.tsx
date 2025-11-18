import React, { useState } from 'react';

import { Box, Text, Title } from '@citizenlab/cl2-component-library';

import { SortOption } from 'api/phase_insights/types';
import useCommonGroundInsights from 'api/phase_insights/useCommonGroundInsights';

import useLocale from 'hooks/useLocale';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import {
  sortItems,
  getDemographicKeys,
  getDemographicLabel,
} from './commonGroundUtils';
import DemographicHeaders from './DemographicHeaders';
import FilterControls from './FilterControls';
import StatementRow from './StatementRow';
import { MethodSpecificInsightProps } from './types';

type ClusterByOption = '' | 'gender' | 'birthyear' | 'domicile';

const CommonGroundInsights = ({ phaseId }: MethodSpecificInsightProps) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const [sortBy, setSortBy] = useState<SortOption>('most_agreed');
  const [clusterBy, setClusterBy] = useState<ClusterByOption>('');

  const { data, isLoading, error } = useCommonGroundInsights({
    phaseId,
    groupBy: clusterBy || undefined,
  });

  if (isLoading) {
    return (
      <Box mt="8px" bg="white">
        <Text>{formatMessage(messages.loading)}</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt="8px" bg="white">
        <Text color="error">
          {formatMessage(messages.errorLoadingCommonGround)}
        </Text>
      </Box>
    );
  }

  const {
    total_count,
    items: unsortedItems,
    demographic_field,
  } = data!.data.attributes;

  const items = sortItems(unsortedItems, sortBy);
  const demographicKeys = getDemographicKeys(demographic_field, clusterBy);

  const getLabelForKey = (key: string) =>
    getDemographicLabel(key, clusterBy, demographic_field, locale);

  return (
    <Box mt="8px" bg="white">
      {/* Header with title and filters */}
      <Box mb="24px">
        <Title variant="h3" mb="16px">
          {formatMessage(
            {
              id: 'admin.insights.common_ground.all_statements',
              defaultMessage: 'All statements ({count})',
            },
            { count: total_count }
          )}
        </Title>

        <FilterControls
          sortBy={sortBy}
          clusterBy={clusterBy}
          onSortChange={setSortBy}
          onClusterChange={setClusterBy}
        />
      </Box>

      {/* Statements list container with horizontal scroll */}
      <Box overflow="auto">
        <Box>
          {/* Demographic column headers */}
          {clusterBy && (
            <DemographicHeaders
              demographicKeys={demographicKeys}
              getDemographicLabel={getLabelForKey}
            />
          )}

          {/* Statements list */}
          <Box>
            {items.map((item) => (
              <StatementRow
                key={item.id}
                item={item}
                clusterBy={clusterBy}
                demographicKeys={demographicKeys}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CommonGroundInsights;
