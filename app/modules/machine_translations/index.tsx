import React from 'react';

import { ModuleConfiguration } from 'utils/moduleUtils';
import ActionBarTranslateButton from './citizen/components/ActionBarTranslateButton';
import CommentTranslateButton from './citizen/components/CommentTranslateButton';
import IdeasShowTranslateButton from './citizen/components/IdeasShowTranslateButton';
import InitiativesTranslateButton from './citizen/components/InitiativesTranslateButton';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.PostShowComponents.ActionBar.right': ActionBarTranslateButton,
    'app.components.PostShowComponents.CommentFooter.left': (props) => (
      <CommentTranslateButton {...props} />
    ),
    'app.containers.InitiativesShow.left': InitiativesTranslateButton,
    'app.containers.IdeasShow.left': IdeasShowTranslateButton,
  },
};

export default configuration;
