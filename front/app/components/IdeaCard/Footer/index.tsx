import React from 'react';

// components
import IdeaCardFooter from './IdeaCardFooter';
import FooterWithReactionControl from './FooterWithReactionControl';

// typings
import { IProject } from 'api/projects/types';
import { IIdeaData } from 'api/ideas/types';
import { ParticipationMethod } from 'utils/participationContexts';

interface Props {
  project?: IProject;
  idea: IIdeaData;
  hideIdeaStatus: boolean;
  participationMethod: ParticipationMethod | undefined;
}

const Footer = ({
  project,
  idea,
  hideIdeaStatus,
  participationMethod,
}: Props) => {
  if (!project) return null;

  const commentingEnabled =
    project.data.attributes.action_descriptor.commenting_idea.enabled;
  const projectHasComments = project.data.attributes.comments_count > 0;
  const showCommentCount = commentingEnabled || projectHasComments;

  // the participationMethod checks ensure that the footer is not shown on
  // e.g. /ideas index page because there's no participationMethod
  // passed through to the IdeaCards from there.
  // Should probably have better solution in future.
  if (participationMethod === 'voting') {
    return <IdeaCardFooter idea={idea} showCommentCount={showCommentCount} />;
  }

  if (participationMethod === 'ideation') {
    return (
      <FooterWithReactionControl
        idea={idea}
        hideIdeaStatus={hideIdeaStatus}
        showCommentCount={showCommentCount}
      />
    );
  }

  return null;
};

export default Footer;
