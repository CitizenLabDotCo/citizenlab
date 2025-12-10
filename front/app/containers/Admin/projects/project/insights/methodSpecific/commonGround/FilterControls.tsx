import React from 'react';

import { Box, Text, Select } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import { SortOption } from 'api/common_ground_insights/types';

import { useIntl } from 'utils/cl-intl';

type ClusterByOption = '' | 'gender' | 'birthyear' | 'domicile';

interface Props {
  sortBy: SortOption;
  clusterBy: ClusterByOption;
  onSortChange: (value: SortOption) => void;
  onClusterChange: (value: ClusterByOption) => void;
}

const FilterControls = ({
  sortBy,
  clusterBy,
  onSortChange,
  onClusterChange,
}: Props) => {
  const { formatMessage } = useIntl();

  const sortOptions: IOption[] = [
    {
      value: 'most_agreed',
      label: formatMessage({
        id: 'admin.insights.common_ground.sort.most_agreed',
        defaultMessage: 'Most agreed',
      }),
    },
    {
      value: 'most_disagreed',
      label: formatMessage({
        id: 'admin.insights.common_ground.sort.most_disagreed',
        defaultMessage: 'Most disagreed',
      }),
    },
    {
      value: 'most_controversial',
      label: formatMessage({
        id: 'admin.insights.common_ground.sort.most_controversial',
        defaultMessage: 'Most controversial',
      }),
    },
    {
      value: 'newest',
      label: formatMessage({
        id: 'admin.insights.common_ground.sort.newest',
        defaultMessage: 'Newest',
      }),
    },
  ];

  const clusterByOptions: IOption[] = [
    {
      value: '',
      label: formatMessage({
        id: 'admin.insights.common_ground.cluster.none',
        defaultMessage: 'None',
      }),
    },
    {
      value: 'gender',
      label: formatMessage({
        id: 'admin.insights.common_ground.cluster.gender',
        defaultMessage: 'Gender',
      }),
    },
    {
      value: 'birthyear',
      label: formatMessage({
        id: 'admin.insights.common_ground.cluster.age',
        defaultMessage: 'Age',
      }),
    },
    {
      value: 'domicile',
      label: formatMessage({
        id: 'admin.insights.common_ground.cluster.location',
        defaultMessage: 'Location',
      }),
    },
  ];

  return (
    <Box display="flex" gap="12px" alignItems="flex-end">
      <Box width="200px">
        <Text
          fontSize="xs"
          color="grey700"
          fontWeight="bold"
          mb="4px"
          my="0px"
          style={{ textTransform: 'uppercase' }}
        >
          {formatMessage({
            id: 'admin.insights.common_ground.sort_by',
            defaultMessage: 'SORT BY',
          })}
        </Text>
        <Select
          value={sortBy}
          options={sortOptions}
          onChange={(option) => onSortChange(option.value as SortOption)}
        />
      </Box>

      <Box width="200px">
        <Text
          fontSize="xs"
          color="grey700"
          fontWeight="bold"
          mb="4px"
          my="0px"
          style={{ textTransform: 'uppercase' }}
        >
          {formatMessage({
            id: 'admin.insights.common_ground.cluster_by',
            defaultMessage: 'CLUSTER BY',
          })}
        </Text>
        <Select
          value={clusterBy}
          options={clusterByOptions}
          onChange={(option) =>
            onClusterChange(option.value as ClusterByOption)
          }
        />
      </Box>

      <Box width="200px">
        <Text
          fontSize="xs"
          color="grey700"
          fontWeight="bold"
          mb="4px"
          my="0px"
          style={{ textTransform: 'uppercase' }}
        >
          {formatMessage({
            id: 'admin.insights.common_ground.filter_by',
            defaultMessage: 'FILTER BY',
          })}
        </Text>
        <Select
          value="all"
          options={[
            {
              value: 'all',
              label: formatMessage({
                id: 'admin.insights.common_ground.filter.all_users',
                defaultMessage: 'All users',
              }),
            },
          ]}
          onChange={() => {}}
          disabled
        />
      </Box>
    </Box>
  );
};

export default FilterControls;
