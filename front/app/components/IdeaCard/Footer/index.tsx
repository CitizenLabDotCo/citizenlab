import React from 'react';

import { IIdeaData } from 'api/ideas/types';
import { ParticipationMethod } from 'api/phases/types';
import useProjectById from 'api/projects/useProjectById';

import FooterWithReactionControl from './FooterWithReactionControl';
import IdeaCardFooter from './IdeaCardFooter';

interface Props {
  idea: IIdeaData;
  hideIdeaStatus: boolean;
  participationMethod: ParticipationMethod | undefined;
}

const Footer = ({ idea, hideIdeaStatus, participationMethod }: Props) => {
  const { data: project } = useProjectById(idea.relationships.project.data.id);

  if (!project) return null;

  const commentingEnabled =
    project.data.attributes.action_descriptors.commenting_idea.enabled;
  const ideaHasComments = idea.attributes.comments_count > 0;
  const showCommentCount = commentingEnabled || ideaHasComments;

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
