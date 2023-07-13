import React from 'react';

// api
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';
import useIdeaImage from 'api/idea_images/useIdeaImage';

// i18n
import useLocalize from 'hooks/useLocalize';

// components
import Card from 'components/UI/Card/Compact';
import ImagePlaceholder from 'components/IdeaCard/ImagePlaceholder';
import Footer from 'components/IdeaCard/Footer';

// router
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import clHistory from 'utils/cl-router/history';

// typings
import { IIdeaData } from 'api/ideas/types';

interface Props {
  idea: IIdeaData;
  phaseId: string;
}

const VotingResultCard = ({ idea, phaseId }: Props) => {
  const localize = useLocalize();
  const { data: phase } = usePhase(phaseId);
  const { data: project } = useProjectById(idea.relationships.project.data.id);
  const { data: ideaImage } = useIdeaImage(
    idea.id,
    idea.relationships.idea_images.data?.[0]?.id
  );

  const ideaTitle = localize(idea.attributes.title_multiloc);
  const { slug } = idea.attributes;
  const params = '?go_back=true';
  const votingMethod = phase?.data.attributes.voting_method;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    updateSearchParams({ scroll_to_card: idea.id });

    clHistory.push(`/ideas/${slug}${params}`);
  };

  return (
    <Card
      id={idea.id}
      to={`/ideas/${slug}${params}`}
      onClick={handleClick}
      title={ideaTitle}
      rank={1}
      image={ideaImage?.data.attributes.versions.medium}
      imagePlaceholder={
        <ImagePlaceholder
          participationMethod="voting"
          votingMethod={votingMethod}
        />
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
