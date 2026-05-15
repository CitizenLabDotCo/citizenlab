import React from 'react';

import useLocalize from 'hooks/useLocalize';

import { AccessibilityProps } from 'components/admin/Graphs/typings';

import { useIntl } from 'utils/cl-intl';

import Card from '../../_shared/Card';
import A11yTable from '../_shared/A11yTable';
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
  const { tableData } = useVisitorReferrerTypes({
    projectId: props.projectId,
    startAt: props.startAt,
    endAt: props.endAt,
  });
  const { formatMessage } = useIntl();
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
      {view === 'chart' && (
        <>
          <DescriptionText
            description={description}
            descriptionId={descriptionId}
          />
          <A11yTable
            columns={[
              {
                key: 'referrer',
                label: formatMessage(messages.reffererColumn),
              },
              {
                key: 'visits',
                label: formatMessage(messages.visitsColumn),
              },
              {
                key: 'visitors',
                label: formatMessage(messages.visitorsColumn),
              },
            ]}
            data={tableData || []}
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
