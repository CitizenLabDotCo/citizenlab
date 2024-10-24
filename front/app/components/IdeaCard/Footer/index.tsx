import React from 'react';

import { IIdeaData } from 'api/ideas/types';
import { ParticipationMethod } from 'api/phases/types';
import useProjectById from 'api/projects/useProjectById';

import IdeaFooter from './IdeaFooter';
import ProposalFooter from './ProposalFooter';
import VotingFooter from './VotingFooter';

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
    return <VotingFooter idea={idea} showCommentCount={showCommentCount} />;
  }

  if (participationMethod === 'ideation') {
    return (
      <IdeaFooter
        idea={idea}
        participationMethod={participationMethod}
        hideIdeaStatus={hideIdeaStatus}
        showCommentCount={showCommentCount}
      />
    );
  }
  if (participationMethod === 'proposals') {
    return (
      <ProposalFooter
        showCommentCount={showCommentCount}
        idea={idea}
        hideIdeaStatus={hideIdeaStatus}
      />
    );
  }

  return null;
};

export default Footer;
