import React from 'react';

import messages from './messages';
import Settings from './Settings';
import SpotlightProjectInner from './SpotlightProject';

const SpotlightProject = () => {
  return <SpotlightProjectInner />;
};

SpotlightProject.craft = {
  related: {
    settings: Settings,
  },
};

export const spotlightProjectTitle = messages.spotlightProject;

export default SpotlightProject;
