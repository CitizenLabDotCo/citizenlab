import React from 'react';
import { useParams } from 'react-router-dom';

import useAuthorsByDomicile from 'api/analysis_stats/useAuthorsByDomicile';
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
import useLocalize from 'hooks/useLocalize';
import useUserCustomFieldsOptions from 'api/user_custom_fields_options/useUserCustomFieldsOptions';
import { xor } from 'lodash-es';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

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

const AuthorsByDomicile = ({ customFieldId }: Props) => {
  const localize = useLocalize();
  const { analysisId } = useParams() as { analysisId: string };
  const filters = useAnalysisFilterParams();
  const { data: totalAuthorsByDomicile } = useAuthorsByDomicile({
    analysisId,
    queryParams: {},
  });
  const { data: filteredAuthorsByDomicile } = useAuthorsByDomicile({
    analysisId,
    queryParams: filters,
  });
  const { data: options } = useUserCustomFieldsOptions(customFieldId);

  const filterKey = `author_custom_${customFieldId}`;

  const chartData =
    totalAuthorsByDomicile &&
    Object.entries(totalAuthorsByDomicile?.data.attributes.series.users).map(
      ([optionId, count]) => {
        const option = options?.data.find((o) => o.id === optionId);

        const name = localize(option?.attributes.title_multiloc) || optionId;
        const shortName = name.slice(0, 2);
        const filtered =
          filteredAuthorsByDomicile?.data.attributes.series.users[optionId];
        return {
          optionKey: option?.attributes.key,
          name,
          shortName,
          total: count,
          filtered:
            filteredAuthorsByDomicile?.data.attributes.series.users[optionId],
          notFiltered: count - (filtered || 0),
        };
      }
    );

  const handleClick = (data) => {
    const toggledOptions = xor(filters[filterKey] || [], [data.optionKey]);
    if (toggledOptions.length === 0) {
      updateSearchParams({ [filterKey]: undefined });
    } else {
      updateSearchParams({ [filterKey]: toggledOptions });
    }
  };

  if (!chartData) return null;

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <ResponsiveContainer width="100%" height={105}>
        <BarChart data={chartData} margin={{ top: 20 }}>
          <XAxis dataKey="shortName" />
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

export default AuthorsByDomicile;
