import React from 'react';

import {
  Box,
  colors,
  defaultStyles,
  Title,
  Text,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { xor } from 'lodash-es';
import { useParams } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';

import useAuthorsByDomicile from 'api/analysis_stats/useAuthorsByDomicile';
import useUserCustomFieldsOptions from 'api/custom_field_options/useCustomFieldOptions';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import useAnalysisFilterParams from '../hooks/useAnalysisFilterParams';

import messages from './messages';

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
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    Object.entries(totalAuthorsByDomicile?.data.attributes.series.users).map(
      ([optionId, count]) => {
        const option = options?.data.find((o) => o.id === optionId);

        let name;
        let shortName;
        let filtered;
        let optionKey;

        if (optionId === '_blank') {
          name = formatMessage(messages.unknown);
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
        <FormattedMessage {...messages.domicileChartTooLarge} />
      </Text>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      border="1px solid"
      borderColor={colors.borderLight}
      borderRadius={stylingConsts.borderRadius}
      px="8px"
      py="16px"
    >
      <ResponsiveContainer width="100%" height={100}>
        <BarChart
          data={chartData}
          margin={{ top: 20, left: 8, right: 8 }}
          accessibilityLayer
        >
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
