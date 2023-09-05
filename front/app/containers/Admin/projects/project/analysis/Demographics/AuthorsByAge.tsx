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
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import translations from './translations';

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
  const { formatMessage } = useIntl();
  const { analysisId } = useParams() as { analysisId: string };
  const filters = useAnalysisFilterParams();
  const { data: totalAuthorsByAge, isLoading: isLoadingTotal } =
    useAuthorsByAge({
      analysisId,
      queryParams: {},
    });
  const { data: filteredAuthorsByAge, isLoading: isLoadingFiltered } =
    useAuthorsByAge({
      analysisId,
      queryParams: filters,
    });

  if (isLoadingFiltered || isLoadingTotal) return null;

  const chartData =
    totalAuthorsByAge &&
    totalAuthorsByAge?.data.attributes.series.bins.map((fromAge, index) => {
      let name;
      let shortName;
      let total;
      let filtered;

      if (fromAge === null) {
        name = formatMessage(translations.unknown);
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
    // Handle filter for domcile unknown
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
      <Title my="0" variant="h6" fontWeight="normal">
        <FormattedMessage {...translations.authorsByAge} />
      </Title>
      <ResponsiveContainer width="100%" height={100}>
        <BarChart data={chartData} margin={{ top: 20, left: 8, right: 8 }}>
          <XAxis dataKey="shortName" interval={0} tickLine={false} />
          <Bar stackId="a" dataKey="filtered" onClick={handleClick}>
            {chartData.map((entry, index) => (
              <Cell
                cursor="pointer"
                fill={entry.shortName === '?' ? colors.teal100 : colors.teal200}
                key={`cell-${index}`}
              />
            ))}
          </Bar>
          <Bar stackId="a" dataKey="notFiltered" onClick={handleClick}>
            <LabelList dataKey="total" position="top" fill={colors.grey600} />
            {chartData.map((entry, index) => (
              <Cell
                cursor="pointer"
                fill={entry.shortName === '?' ? colors.grey200 : colors.grey300}
                key={`cell-${index}`}
              />
            ))}
          </Bar>
          <Tooltip content={<CustomTooltip />} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default AuthorsByAge;
