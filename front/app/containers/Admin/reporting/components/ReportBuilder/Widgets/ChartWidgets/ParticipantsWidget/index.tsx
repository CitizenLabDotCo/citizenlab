import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import usePhases from 'api/phases/usePhases';

import useLocalize from 'hooks/useLocalize';

import { hasEmbeddedSurvey } from 'containers/ProjectsShowPage/shared/header/utils';

import { AccessibilityProps } from 'components/admin/Graphs/typings';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

import Card from '../../_shared/Card';
import { DescriptionText } from '../_shared/DescriptionText';
import messages from '../messages';

import ChartWidgetSettings from './ChartWidgetSettings';
import ParticipantsCard from './ParticipantsCard';
import { Props } from './typings';

const ParticipantsWidget = ({
  title,
  ariaLabel,
  description,
  ...props
}: Props & AccessibilityProps) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: phases } = usePhases(props.projectId);

  const descriptionId = `${React.useId()}-description`;
  const accessibilityProps = {
    ariaLabel: ariaLabel
      ? localize(ariaLabel)
      : title
      ? localize(title)
      : undefined,
    ariaDescribedBy: description ? descriptionId : undefined,
  };

  return (
    <Card
      title={title}
      ariaLabel={ariaLabel}
      description={description}
      pagebreak
    >
      {hasEmbeddedSurvey(phases?.data) && (
        <Box mb="16px">
          <Warning>
            {formatMessage(messages.adminInaccurateParticipantsWarning1)}
          </Warning>
        </Box>
      )}
      <ParticipantsCard {...props} {...accessibilityProps} />
      <DescriptionText
        description={description}
        descriptionId={descriptionId}
      />
    </Card>
  );
};

ParticipantsWidget.craft = {
  props: {
    title: {},
    ariaLabel: undefined,
    description: undefined,
    projectId: undefined,
    startAt: undefined,
    endAt: null,
    resolution: undefined,
    compareStartAt: undefined,
    compareEndAt: undefined,
    hideStatistics: undefined,
    showVisitors: undefined,
    phaseId: undefined,
  },
  related: {
    settings: ChartWidgetSettings,
  },
};

export const participantsTitle = messages.participantsTimeline;

export default ParticipantsWidget;
