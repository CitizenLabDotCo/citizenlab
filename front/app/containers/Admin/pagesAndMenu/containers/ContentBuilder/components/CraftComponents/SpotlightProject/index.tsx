import React from 'react';

import { Multiloc } from 'typings';

import useLocalize from 'hooks/useLocalize';

import messages from './messages';
import Settings from './Settings';
import SpotlightProjectInner from './SpotlightProject';

interface Props {
  title_multiloc: Multiloc;
}

const SpotlightProject = ({ title_multiloc }: Props) => {
  const localize = useLocalize();

  return <SpotlightProjectInner title={localize(title_multiloc)} />;
};

SpotlightProject.craft = {
  related: {
    settings: Settings,
  },
};

export const spotlightProjectTitle = messages.spotlightProject;

export default SpotlightProject;
