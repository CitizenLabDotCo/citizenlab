import React from 'react';

import { ModuleConfiguration } from 'utils/moduleUtils';
import ActionBarTranslateButton from './citizen/components/ActionBarTranslateButton';
import CommentTranslateButton from './citizen/components/CommentTranslateButton';
import IdeasShowTranslateButton from './citizen/components/IdeasShowTranslateButton';
import InitiativesTranslateButton from './citizen/components/InitiativesTranslateButton';
import PostShowTranslatedBody from './citizen/components/PostShowTranslatedBody';
import PostShowTranslatedCommentBody from './citizen/components/PostShowTranslatedCommentBody';
import PostShowTranslatedTitle from './citizen/components/PostShowTranslatedTitle';

const configuration: ModuleConfiguration = {
  outlets: {
    'app.components.PostShowComponents.ActionBar.right':
      ActionBarTranslateButton,
    'app.components.PostShowComponents.CommentFooter.left': (props) => (
      <CommentTranslateButton {...props} />
    ),
    'app.containers.InitiativesShow.left': InitiativesTranslateButton,
    'app.containers.IdeasShow.left': IdeasShowTranslateButton,
    'app.components.PostShowComponents.CommentBody.translation':
      PostShowTranslatedCommentBody,
    'app.components.PostShowComponents.Body.translation':
      PostShowTranslatedBody,
    'app.components.PostShowComponents.Title.translation':
      PostShowTranslatedTitle,
  },
};

export default configuration;
