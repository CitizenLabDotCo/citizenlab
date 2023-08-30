import React from 'react';
import { useParams } from 'react-router-dom';

import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';

import {
  Box,
  colors,
  defaultStyles,
  Title,
  Text,
} from '@citizenlab/cl2-component-library';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import useAuthorsByAge from 'api/analysis_stats/useAuthorsByAge';

// Custom tooltip is rendered when the user hovers over a bar
const CustomTooltip = ({ payload }: { payload?: any }) => {
  const total = payload[0]?.payload?.total;
  const filtered = payload[0]?.payload.filtered;

  return (
    <Box
      bg={colors.white}
      boxShadow={defaultStyles.boxShadowHoverBig}
      p="12px"
      borderRadius="3px"
      w="120px"
    >
      <Title variant="h6" my="4px">
        {payload[0]?.payload?.name}
      </Title>
      <Text m="2px">
        {filtered === total ? (
          <>{total}</>
        ) : (
          <>
            {filtered} / {total}
          </>
        )}
      </Text>
    </Box>
  );
};

type Props = {
  customFieldId: string;
};

const ageToBirthyear = (age: number): number => {
  const now = new Date().getFullYear();
  return now - age;
};

const AuthorsByAge = ({ customFieldId }: Props) => {
  const { analysisId } = useParams() as { analysisId: string };
  const filters = useAnalysisFilterParams();
  const { data: totalAuthorsByAge } = useAuthorsByAge({
    analysisId,
    queryParams: {},
  });
  const { data: filteredAuthorsByAge } = useAuthorsByAge({
    analysisId,
    queryParams: filters,
  });

  const chartData =
    totalAuthorsByAge &&
    totalAuthorsByAge?.data.attributes.series.bins.map((fromAge, index) => {
      let name;
      let shortName;
      let total;
      let filtered;

      if (fromAge === null) {
        name = 'Unknown';
        shortName = '?';
        total = totalAuthorsByAge?.data.attributes.unknown_age_count;
        filtered = filteredAuthorsByAge?.data.attributes.unknown_age_count;
      } else {
        name = `${fromAge} - ${fromAge + 9}`;
        shortName = fromAge;
        total = totalAuthorsByAge?.data.attributes.series.user_counts[index];
        filtered =
          filteredAuthorsByAge?.data.attributes.series.user_counts[index];
      }

      return {
        name,
        shortName,
        fromAge,
        total,
        filtered,
        notFiltered: total - (filtered || 0),
      };
    });

  const filterKeyFrom = `author_custom_${customFieldId}_from`;
  const filterKeyTo = `author_custom_${customFieldId}_to`;
  const filterKeyIn = `author_custom_${customFieldId}`;

  const filterFrom = Number(filters[filterKeyFrom]);
  const filterTo = Number(filters[filterKeyTo]);
  const filterIn = filters[filterKeyIn];

  const handleClick = ({ fromAge }) => {
    // Handle unknown case
    if (fromAge === null) {
      if (filterIn?.includes(null)) {
        // if unknown filter active
        updateSearchParams({
          [filterKeyFrom]: undefined,
          [filterKeyTo]: undefined,
          [filterKeyIn]: undefined,
        });
      } else {
        // if unkown filter inactive
        updateSearchParams({
          [filterKeyFrom]: undefined,
          [filterKeyTo]: undefined,
          [filterKeyIn]: [null],
        });
      }
      return;
    }

    // Handle range cases
    const fromBirthyear = ageToBirthyear(fromAge + 9);
    const toBirthyear = ageToBirthyear(fromAge);
    if (fromBirthyear === filterFrom && toBirthyear === filterTo) {
      // if range filter active
      updateSearchParams({
        [filterKeyFrom]: undefined,
        [filterKeyTo]: undefined,
      });
    } else {
      // if range filter inactive
      updateSearchParams({
        [filterKeyFrom]: fromBirthyear,
        [filterKeyTo]: toBirthyear,
      });
    }
  };

  if (!chartData) return null;

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <ResponsiveContainer width="100%" height={105}>
        <BarChart data={chartData} margin={{ top: 20, left: 8, right: 8 }}>
          <XAxis dataKey="shortName" interval={0} />
          <Bar
            stackId="a"
            dataKey="filtered"
            fill={colors.teal300}
            name="Currently filtered"
            onClick={handleClick}
          >
            {chartData.map((_entry, index) => (
              <Cell
                cursor="pointer"
                fill={colors.teal200}
                key={`cell-${index}`}
              />
            ))}
          </Bar>
          <Bar
            stackId="a"
            dataKey="notFiltered"
            fill={colors.grey200}
            name="Not currently filtered"
          >
            <LabelList dataKey="total" position="top" />
          </Bar>
          <Tooltip content={<CustomTooltip />} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default AuthorsByAge;
