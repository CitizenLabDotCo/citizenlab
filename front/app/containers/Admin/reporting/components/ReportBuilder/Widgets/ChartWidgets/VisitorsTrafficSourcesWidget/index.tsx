import React from 'react';

import useLocalize from 'hooks/useLocalize';

import { AccessibilityProps } from 'components/admin/Graphs/typings';

import { useIntl } from 'utils/cl-intl';

import Card from '../../_shared/Card';
import A11yTable, { Column } from '../_shared/A11yTable';
import { DescriptionText } from '../_shared/DescriptionText';
import messages from '../messages';

import Settings from './Settings';
import { Props } from './typings';
import useVisitorReferrerTypes from './useVisitorReferrerTypes';
import VisitorsTrafficSourcesCard from './VisitorTrafficSourcesCard';

const VisitorsTrafficSourcesWidget = ({
  title,
  ariaLabel,
  description,
  view,
  ...props
}: Props & AccessibilityProps) => {
  const localize = useLocalize();
  const descriptionId = `${React.useId()}-description`;
  const accessibilityProps = {
    ariaLabel: ariaLabel
      ? localize(ariaLabel)
      : title
      ? localize(title)
      : undefined,
    ariaDescribedBy: description ? descriptionId : undefined,
  };
  const { pieData } = useVisitorReferrerTypes({
    projectId: props.projectId,
    startAt: props.startAt,
    endAt: props.endAt,
  });
  const { formatMessage } = useIntl();

  const columns: Column[] = [
    {
      key: 'name',
      label: formatMessage(messages.reffererColumn),
    },
    {
      key: 'value',
      label: formatMessage(messages.valueColumn),
    },
    {
      key: 'percentage',
      label: formatMessage(messages.percentageColumn),
      type: 'percentage',
    },
  ];

  return (
    <Card
      title={title}
      ariaLabel={ariaLabel}
      description={description}
      pagebreak
    >
      <VisitorsTrafficSourcesCard
        view={view}
        {...props}
        {...accessibilityProps}
      />
      {view !== 'table' && (
        <>
          <DescriptionText
            description={description}
            descriptionId={descriptionId}
          />
          <A11yTable
            columns={columns}
            data={pieData || []}
            caption={formatMessage(messages.visitorsTrafficSourcesCaption)}
          />
        </>
      )}
    </Card>
  );
};

VisitorsTrafficSourcesWidget.craft = {
  props: {
    title: {},
    ariaLabel: undefined,
    description: undefined,
    projectId: undefined,
    startAtMoment: undefined,
    endAtMoment: null,
  },
  related: {
    settings: Settings,
  },
};

export const visitorsTrafficSourcesTitle = messages.trafficSources;

export default VisitorsTrafficSourcesWidget;
