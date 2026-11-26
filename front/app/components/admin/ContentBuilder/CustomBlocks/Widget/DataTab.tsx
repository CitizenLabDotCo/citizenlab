import React from 'react';

import {
  Box,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import { BlockExplanation } from 'api/custom_blocks/types';
import useReport from 'api/reports/useReport';

import { useReportContext } from 'containers/Admin/reporting/context/ReportContext';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from '../messages';

import DataSource, { isKnownSource } from './DataSource';

interface Props {
  explanation?: BlockExplanation;
  dataSources: string[];
  createdAt: string;
}

// Where a chart's numbers come from, for the admin deciding whether to trust it.
// The explanation is written when the chart is authored, because what a query
// counts — people or actions, which week a Monday belongs to — cannot be read
// back off the SQL.
const DataTab = ({ explanation, dataSources, createdAt }: Props) => {
  const { formatDate } = useIntl();
  const localize = useLocalize();

  // A phase report reaches its project through the phase; a report about a whole
  // project carries it directly.
  const { projectId: phaseProjectId, reportId } = useReportContext();
  const { data: report } = useReport(reportId);
  const projectId =
    phaseProjectId ?? report?.data.relationships.project?.data?.id;

  // Only the tables this tab has words for, so the count never promises a row
  // that does not render.
  const sources = dataSources.filter(isKnownSource);

  return (
    <Box>
      {explanation && (
        <>
          <Text
            variant="boSection"
            fontSize="base"
            fontWeight="bold"
            m="0"
            mb="4px"
          >
            <FormattedMessage {...messages.whatsIncluded} />
          </Text>
          <Text m="0">{localize(explanation.included)}</Text>

          <Text
            variant="boSection"
            fontSize="base"
            fontWeight="bold"
            m="0"
            mt="20px"
            mb="4px"
          >
            <FormattedMessage {...messages.howItsCalculated} />
          </Text>
          <Text m="0">{localize(explanation.calculation)}</Text>

          {explanation.caveat && (
            <Box
              mt="12px"
              p="10px 12px"
              bgColor={colors.grey100}
              borderRadius={stylingConsts.borderRadius}
            >
              <Text variant="boHelper" m="0">
                {localize(explanation.caveat)}
              </Text>
            </Box>
          )}
        </>
      )}

      {sources.length > 0 && (
        <>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="baseline"
            mt="24px"
            mb="12px"
          >
            <Text variant="boSection" fontSize="base" m="0">
              <FormattedMessage {...messages.sources} />
            </Text>
            <Text variant="boHelper" m="0">
              <FormattedMessage
                {...messages.sourceCount}
                values={{ count: sources.length }}
              />
            </Text>
          </Box>
          <Box display="flex" flexDirection="column" gap="16px">
            {sources.map((table) => (
              <DataSource key={table} table={table} projectId={projectId} />
            ))}
          </Box>
        </>
      )}

      <Text variant="boHelper" m="0" mt="24px">
        <FormattedMessage
          {...messages.writtenWhenGenerated}
          values={{
            date: formatDate(createdAt, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
          }}
        />{' '}
        {sources.length > 0 && (
          <FormattedMessage {...messages.linkedScreensAreLive} />
        )}
      </Text>
    </Box>
  );
};

export default DataTab;
