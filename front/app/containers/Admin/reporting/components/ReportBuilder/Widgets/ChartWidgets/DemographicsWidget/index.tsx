import React from 'react';

import { Box, Text, Title } from '@citizenlab/cl2-component-library';

import { useDemographics } from 'api/graph_data_units';

import useLocalize from 'hooks/useLocalize';

import useLayout from 'containers/Admin/reporting/hooks/useLayout';

import { AccessibilityProps } from 'components/admin/Graphs/typings';

import { useIntl } from 'utils/cl-intl';

import Card from '../../_shared/Card';
import cardMessages from '../../_shared/messages';
import NoData from '../../_shared/NoData';
import chartWidgetMessages from '../messages';

import messages from './messages';
import Settings from './Settings';
import Chart from './StackedBarChart';
import { Props } from './typings';

const DemographicsWidget = ({
  title,
  ariaLabel,
  description,
  projectId,
  startAt,
  endAt,
  customFieldId,
  groupId,
}: Props & AccessibilityProps) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const { data: demographicsResponse, isLoading } = useDemographics({
    custom_field_id: customFieldId,
    project_id: projectId,
    start_at: startAt,
    end_at: endAt,
    group_id: groupId,
  });

  const layout = useLayout();

  // since demographicsWidget have another structure, we need to handle localization here
  const chartId = React.useId();
  const descriptionId = `${chartId}-description`;
  const localizedAriaLabel = ariaLabel ? localize(ariaLabel) : undefined;
  const localizedDescription = description ? localize(description) : undefined;
  const chartAriaLabel =
    localizedAriaLabel || (title ? localize(title) : undefined);
  const chartAriaDescribedBy = localizedDescription ? descriptionId : undefined;
  const chartAccessibilityProps = {
    ariaLabel: chartAriaLabel,
    ariaDescribedBy: chartAriaDescribedBy,
  };

  if (isLoading) return null;

  if (!demographicsResponse) {
    return (
      <Box>
        <NoData message={chartWidgetMessages.noData} />
      </Box>
    );
  }

  if (layout === 'narrow') {
    return (
      <Card pagebreak className="e2e-demographics-widget">
        <Chart response={demographicsResponse} {...chartAccessibilityProps} />
        {localizedDescription && (
          <Text color="grey700" fontSize="s" id={descriptionId} mt="16px">
            {formatMessage(cardMessages.description)} {localizedDescription}
          </Text>
        )}
      </Card>
    );
  }

  return (
    <Card pagebreak className="e2e-demographics-widget">
      <Box width="100%" pb="0px" display="flex">
        <Box w="300px" display="flex" flexDirection="column">
          <Title variant="h4" mt="1px" pr="16px">
            {localize(title)}
          </Title>
        </Box>
        <Chart response={demographicsResponse} {...chartAccessibilityProps} />
      </Box>
      {localizedDescription && (
        <Text color="grey700" fontSize="s" id={descriptionId} mt="16px">
          {formatMessage(cardMessages.description)} {localizedDescription}
        </Text>
      )}
    </Card>
  );
};

DemographicsWidget.craft = {
  props: {
    title: undefined,
    ariaLabel: undefined,
    description: undefined,
    projectId: undefined,
    startAt: undefined,
    endAt: null,
    customFieldId: undefined,
    groupId: undefined,
  },
  related: {
    settings: Settings,
  },
};

export const demographicsTitle = messages.demographics;

export default DemographicsWidget;
