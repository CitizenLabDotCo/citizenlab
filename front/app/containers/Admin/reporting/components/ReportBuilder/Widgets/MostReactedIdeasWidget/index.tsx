import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';

import { useMostReactedIdeas } from 'api/graph_data_units';

import { useIntl } from 'utils/cl-intl';

import Card from '../_shared/Card';
import NoData from '../_shared/NoData';
import widgetMessages from '../messages';
import { getEmptyMessage } from '../utils';

import Ideas from './Ideas';
import messages from './messages';
import ProjectInfo from './ProjectInfo';
import Settings from './Settings';
import { Props } from './typings';

const MostReactedIdeasWidget = ({
  title,
  projectId,
  phaseId,
  numberOfIdeas,
  collapseLongText,
}: Props) => {
  const response = useMostReactedIdeas(
    {
      phase_id: phaseId,
      number_of_ideas: numberOfIdeas,
    },
    {
      enabled: !!phaseId,
    }
  );
  const { formatMessage } = useIntl();

  const emptyMessage = getEmptyMessage({ projectId, phaseId });

  if (emptyMessage) {
    return (
      <Card title={title}>
        <NoData message={emptyMessage} />
      </Card>
    );
  }

  if (!response) {
    return <Text>{formatMessage(widgetMessages.noData)}</Text>;
  }

  const {
    ideas,
    project,
    phase,
    idea_images: ideaImages,
  } = response.data.attributes;

  if (!project || !phase) {
    return <Text>{formatMessage(widgetMessages.noData)}</Text>;
  }

  return (
    <Card title={title}>
      <ProjectInfo project={project} phase={phase} />
      <Ideas
        phase={phase}
        ideas={ideas}
        images={ideaImages}
        collapseLongText={collapseLongText}
      />
    </Card>
  );
};

MostReactedIdeasWidget.craft = {
  props: {
    title: {},
    projectId: undefined,
    phaseId: undefined,
    numberOfIdeas: 5,
    collapseLongText: false,
  },
  related: {
    settings: Settings,
  },
};

export const mostReactedIdeasTitle = messages.mostReactedIdeas;

export default MostReactedIdeasWidget;
