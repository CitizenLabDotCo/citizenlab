import React from 'react';

// api
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';
import useIdeaImage from 'api/idea_images/useIdeaImage';

// i18n
import useLocalize from 'hooks/useLocalize';

// components
import { useBreakpoint } from '@citizenlab/cl2-component-library';
import Card from 'components/UI/Card/Compact';
import ImagePlaceholder from 'components/IdeaCard/ImagePlaceholder';
import Rank from './Rank';
import Results from './Results';
import Footer from 'components/IdeaCard/Footer';

// router
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import clHistory from 'utils/cl-router/history';

// utils
import { isNil } from 'utils/helperUtils';
import { roundPercentage } from 'utils/math';

// typings
import { IIdeaData } from 'api/ideas/types';

interface Props {
  idea: IIdeaData;
  phaseId: string;
  rank: number;
}

const VotingResultCard = ({ idea, phaseId, rank }: Props) => {
  const localize = useLocalize();
  const { data: phase } = usePhase(phaseId);
  const { data: project } = useProjectById(idea.relationships.project.data.id);
  const { data: ideaImage } = useIdeaImage(
    idea.id,
    idea.relationships.idea_images.data?.[0]?.id
  );
  const smallerThanPhone = useBreakpoint('phone');

  const ideaTitle = localize(idea.attributes.title_multiloc);
  const { slug } = idea.attributes;
  const params = '?go_back=true';
  const votingMethod = phase?.data.attributes.voting_method;

  const ideaVotes = idea.attributes.votes_count ?? 0;
  const totalVotes = phase?.data.attributes.votes_count;

  const votesPercentage = !isNil(totalVotes)
    ? roundPercentage(ideaVotes, totalVotes)
    : undefined;

  const baskets = idea.attributes.baskets_count;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    updateSearchParams({ scroll_to_card: idea.id });

    clHistory.push(`/ideas/${slug}${params}`);
  };

  const image = ideaImage?.data.attributes.versions.medium;
  const showHeader = !image && smallerThanPhone;

  return (
    <Card
      id={idea.id}
      to={`/ideas/${slug}${params}`}
      onClick={handleClick}
      header={showHeader ? <Rank rank={rank} /> : undefined}
      title={ideaTitle}
      image={image}
      imagePlaceholder={
        smallerThanPhone ? undefined : (
          <ImagePlaceholder
            participationMethod="voting"
            votingMethod={votingMethod}
          />
        )
      }
      imageOverlay={
        showHeader ? undefined : (
          <Rank rank={rank} position="absolute" top="28px" left="28px" />
        )
      }
      body={
        votesPercentage !== undefined ? (
          <Results
            phaseId={phaseId}
            budget={idea.attributes.budget ?? undefined}
            votes={ideaVotes}
            votesPercentage={votesPercentage}
            baskets={
              votingMethod === 'single_voting' ? undefined : baskets ?? 0
            }
          />
        ) : undefined
      }
      footer={
        <Footer
          project={project}
          idea={idea}
          hideIdeaStatus={true}
          participationMethod="voting"
        />
      }
    />
  );
};

export default VotingResultCard;
