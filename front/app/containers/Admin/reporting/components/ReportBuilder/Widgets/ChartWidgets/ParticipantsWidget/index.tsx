import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import usePhases from 'api/phases/usePhases';

import { hasEmbeddedSurvey } from 'containers/ProjectsShowPage/shared/header/utils';

import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';

import Card from '../../_shared/Card';
import messages from '../messages';

import ChartWidgetSettings from './ChartWidgetSettings';
import ParticipantsCard from './ParticipantsCard';
import { Props } from './typings';

const ParticipantsWidget = ({ title, ...props }: Props) => {
  const { formatMessage } = useIntl();
  const { data: phases } = usePhases(props.projectId);

  return (
    <Card title={title} pagebreak>
      {hasEmbeddedSurvey(phases?.data) && (
        <Box mb="16px">
          <Warning>
            {formatMessage(messages.adminInaccurateParticipantsWarning1)}
          </Warning>
        </Box>
      )}
      <ParticipantsCard {...props} />
    </Card>
  );
};

ParticipantsWidget.craft = {
  props: {
    title: {},
    projectId: undefined,
    startAt: undefined,
    endAt: null,
    resolution: undefined,
    compareStartAt: undefined,
    compareEndAt: undefined,
    hideStatistics: undefined,
  },
  related: {
    settings: ChartWidgetSettings,
  },
};

export const participantsTitle = messages.participantsTimeline;

export default ParticipantsWidget;
