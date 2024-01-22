import React from 'react';

// components
import Card from '../_shared/Card';
import ProjectInfo from './ProjectInfo';
import Ideas from './Ideas';
import NoData from '../_shared/NoData';
import Settings from './Settings';

// i18n
import messages from './messages';

// typings
import { Props, Response } from './typings';

// hooks
import useGraphDataUnits from 'api/graph_data_units/useGraphDataUnits';

const MostReactedIdeasWidget = ({
  title,
  phaseId,
  numberOfIdeas,
  collapseLongText,
}: Props) => {
  const response = useGraphDataUnits<Response>(
    {
      resolvedName: 'MostReactedIdeasWidget',
      props: {
        phaseId,
        numberOfIdeas,
      },
    },
    {
      enabled: !!phaseId,
    }
  );

  if (!response) {
    return (
      <Card title={title}>
        <NoData message={messages.noProjectSelected} />
      </Card>
    );
  }

  const {
    ideas,
    project,
    phase,
    idea_images: ideaImages,
  } = response.data.attributes;

  return (
    <Card title={title}>
      <ProjectInfo project={project} phase={phase} />
      <Ideas
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
  custom: {
    title: messages.mostReactedIdeas,
  },
};

export default MostReactedIdeasWidget;
