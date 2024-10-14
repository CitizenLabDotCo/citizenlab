import React from 'react';

import messages from './messages';
import Settings from './Settings';

const SpotlightProject = () => {
  return <div>Sup</div>;
};

SpotlightProject.craft = {
  related: {
    settings: Settings,
  },
};

export const spotlightProjectTitle = messages.spotlightProject;

export default SpotlightProject;
