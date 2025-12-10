import React, { useState } from 'react';

import { Box, Text, Title } from '@citizenlab/cl2-component-library';

import { SortOption } from 'api/common_ground_insights/types';
import useCommonGroundInsights from 'api/common_ground_insights/useCommonGroundInsights';

import useLocale from 'hooks/useLocale';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import DemographicHeaders from './DemographicHeaders';
import FilterControls from './FilterControls';
import StatementRow from './StatementRow';
import { sortItems, getDemographicKeys, getDemographicLabel } from './utils';

type ClusterByOption = '' | 'gender' | 'birthyear' | 'domicile';

interface Props {
  phaseId: string;
}

const StatementsList = ({ phaseId }: Props) => {
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
      <Box bg="white">
        <Text>{formatMessage(messages.loading)}</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg="white">
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
    <Box bg="white">
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

      <Box overflow="auto">
        <Box>
          {clusterBy && (
            <DemographicHeaders
              demographicKeys={demographicKeys}
              getDemographicLabel={getLabelForKey}
            />
          )}

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

export default StatementsList;
