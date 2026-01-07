import React from 'react';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';

import useLocalize from 'hooks/useLocalize';

import HealthScoreWidget from 'containers/Admin/communityMonitor/components/LiveMonitor/components/HealthScoreWidget';

import { AccessibilityProps } from 'components/admin/Graphs/typings';

import Card from '../_shared/Card';
import { DescriptionText } from '../ChartWidgets/_shared/DescriptionText';

import messages from './messages';
import Settings from './Settings';
import { Props } from './typings';

const CommunityMonitorHealthScoreWidget = ({
  quarter,
  year,
  ariaLabel,
  description,
}: Props & AccessibilityProps) => {
  const { data: project } = useCommunityMonitorProject({});
  const phaseId = project?.data.relationships.current_phase?.data?.id;
  const localize = useLocalize();
  const descriptionId = `${React.useId()}-description`;
  const accessibilityProps = {
    ariaLabel: ariaLabel ? localize(ariaLabel) : undefined,
    ariaDescribedBy: description ? descriptionId : undefined,
  };
  return (
    <Card ariaLabel={ariaLabel} description={description}>
      <HealthScoreWidget
        phaseId={phaseId}
        quarter={quarter}
        year={year}
        {...accessibilityProps}
      />
      <DescriptionText
        description={description}
        descriptionId={descriptionId}
      />
    </Card>
  );
};

CommunityMonitorHealthScoreWidget.craft = {
  props: {
    title: {},
    ariaLabel: undefined,
    description: undefined,
  },
  related: {
    settings: Settings,
  },
};

export const communityMonitorHealthScoreTitle =
  messages.communityMonitorHealthScoreTitle;

export default CommunityMonitorHealthScoreWidget;
