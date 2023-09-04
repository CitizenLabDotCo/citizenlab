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

const AuthorsByDomicile = ({ customFieldId }: Props) => {
  const { formatMessage } = useIntl();
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

  const chartBarCount = Object.keys(
    totalAuthorsByDomicile?.data.attributes.series.users || {}
  ).length;

  const chartData =
    totalAuthorsByDomicile &&
    Object.entries(totalAuthorsByDomicile?.data.attributes.series.users).map(
      ([optionId, count]) => {
        const option = options?.data.find((o) => o.id === optionId);

        let name;
        let shortName;
        let filtered;
        let optionKey;

        if (optionId === '_blank') {
          name = formatMessage(translations.unknown);
          shortName = '?';
          filtered =
            filteredAuthorsByDomicile?.data.attributes.series.users[optionId];
          optionKey = null;
        } else {
          name = localize(option?.attributes.title_multiloc) || optionId;
          shortName = name.slice(
            0,
            chartBarCount && chartBarCount > 20 ? 1 : 2
          );
          filtered =
            filteredAuthorsByDomicile?.data.attributes.series.users[optionId];
          optionKey = option?.attributes.key;
        }

        return {
          name,
          shortName,
          total: count,
          filtered:
            filteredAuthorsByDomicile?.data.attributes.series.users[optionId],
          notFiltered: count - (filtered || 0),
          optionKey,
        };
      }
    );

  const handleClick = (data, _index, event) => {
    let newFilterValue;
    if (event.shiftKey) {
      newFilterValue = xor(filters[filterKey] || [], [data.optionKey]);
    } else {
      newFilterValue = [data.optionKey];
    }

    if (newFilterValue.length === 0) {
      updateSearchParams({ [filterKey]: undefined });
    } else {
      updateSearchParams({ [filterKey]: newFilterValue });
    }
  };

  if (!chartData) return null;

  // From the data analysis on current (2023) usage patterns, we want to make
  // sure the graph displays in an optimal way for up to 16 areas and is usable
  // for up to 26 (+ 1 unknown) areas.
  // See https://citizenlabco.slack.com/archives/C05EZTFP46N/p1693389147200259
  if (chartData.length > 27) {
    return (
      <Text m="0" color="grey600" fontSize="s" textAlign="center">
        <FormattedMessage {...translations.domicileChartTooLarge} />
      </Text>
    );
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Title my="0" variant="h6" fontWeight="normal">
        <FormattedMessage {...translations.authorsByDomicile} />
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

export default AuthorsByDomicile;
