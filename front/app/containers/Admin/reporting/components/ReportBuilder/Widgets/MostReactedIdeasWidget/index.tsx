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
import { Props } from './typings';

const MostReactedIdeasWidget = ({
  title,
  projectId,
  phaseId,
  numberOfIdeas,
  collapseLongText,
}: Props) => {
  return (
    <Card title={title}>
      <ProjectInfo projectId={projectId} phaseId={phaseId} />
      {projectId ? (
        <Ideas
          projectId={projectId}
          phaseId={phaseId}
          numberOfIdeas={numberOfIdeas}
          collapseLongText={collapseLongText}
        />
      ) : (
        <NoData message={messages.noProjectSelected} />
      )}
    </Card>
  );
};

MostReactedIdeasWidget.craft = {
  props: {
    title: undefined,
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
