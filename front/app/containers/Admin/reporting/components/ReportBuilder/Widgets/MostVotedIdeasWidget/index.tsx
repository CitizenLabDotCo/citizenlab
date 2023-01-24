import React from 'react';

// styling
import { BORDER } from '../constants';
import { stylingConsts } from 'utils/styleUtils';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Header from './Header';
import Ideas from './Ideas';
import Settings from './Settings';

// i18n
import messages from './messages';

// typings
import { Props } from './typings';

const MostVotedIdeasWidget = ({
  title,
  projectId,
  phaseId,
  numberOfIdeas,
  collapseLongText,
}: Props) => {
  return (
    <Box
      border={BORDER}
      mt="4px"
      mb="4px"
      borderRadius={stylingConsts.borderRadius}
    >
      <Header title={title} projectId={projectId} phaseId={phaseId} />
      {projectId && (
        <Ideas
          projectId={projectId}
          phaseId={phaseId}
          numberOfIdeas={numberOfIdeas}
          collapseLongText={collapseLongText}
        />
      )}
    </Box>
  );
};

MostVotedIdeasWidget.craft = {
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
    title: messages.mostVotedIdeas,
  },
};

export default MostVotedIdeasWidget;
