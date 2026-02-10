import React from 'react';

import { useBreakpoint, Box, Title } from '@citizenlab/cl2-component-library';
import { useSearch } from 'utils/router';
import { RouteType } from 'routes';

import useIdeaImage from 'api/idea_images/useIdeaImage';
import { IIdea } from 'api/ideas/types';
import useIdeaById from 'api/ideas/useIdeaById';
import usePhase from 'api/phases/usePhase';

import useLocalize from 'hooks/useLocalize';

import clHistory from 'utils/cl-router/history';
import Link from 'utils/cl-router/Link';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';

import Body from './Body';
import CardImage from './CardImage';
import Container from './Container';
import Footer from './Footer';
import { useScrollToCard } from './hooks/useScrollToCard';
import Interactions from './Interactions';

export interface Props {
  ideaId: string;
  phaseId?: string | null;
  hideImage?: boolean;
  hideImagePlaceholder?: boolean;
  hideIdeaStatus?: boolean;
}

interface IdeaCardProps extends Props {
  idea: IIdea;
}

const IdeaCard = ({
  idea,
  phaseId,
  hideImage = false,
  hideImagePlaceholder = false,
  hideIdeaStatus = false,
}: IdeaCardProps) => {
  const { data: ideaImage } = useIdeaImage(
    idea.data.id,
    idea.data.relationships.idea_images.data?.[0]?.id
  );

  const image =
    !hideImage && ideaImage ? ideaImage.data.attributes.versions.medium : null;

  const smallerThanPhone = useBreakpoint('phone');
  const smallerThanTablet = useBreakpoint('tablet');

  const localize = useLocalize();

  const { data: phase } = usePhase(phaseId);

  const phaseData = phase?.data;
  const participationMethod = phaseData?.attributes.participation_method;
  const config = participationMethod && getMethodConfig(participationMethod);
  const hideBody = config?.hideAuthorOnIdeas;

  const ideaTitle = localize(idea.data.attributes.title_multiloc, {
    maxChar: 50,
  });
  const [searchParams] = useSearch({ strict: false });
  const scrollToCardParam = searchParams.get('scroll_to_card');

  // Scroll to this card if it matches the scroll_to_card search param
  const shouldScrollToCard =
    scrollToCardParam && idea.data.id === scrollToCardParam
      ? scrollToCardParam
      : undefined;

  useScrollToCard(shouldScrollToCard, smallerThanPhone);

  const { slug } = idea.data.attributes;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    updateSearchParams({ scroll_to_card: idea.data.id });
    let ideaUrl = `/ideas/${slug}?go_back=true`;
    if (phaseId) {
      ideaUrl += `&phase_context=${phaseId}`;
    }
    clHistory.push(ideaUrl as RouteType, {
      scrollToTop: true,
    });
  };

  return (
    <Container
      className={`e2e-card e2e-idea-card`}
      id={idea.data.id}
      onClick={handleClick}
    >
      <CardImage
        phase={phaseData}
        image={image}
        hideImagePlaceholder={hideImagePlaceholder}
      />

      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        w="100%"
        // Height of 100% needed to extent the card to the bottom of the row when there
        // is a card with an image and a card without an image in the same row.
        h="100%"
        overflowX="hidden"
      >
        <Box
          mb={
            smallerThanTablet
              ? '24px'
              : !image && hideImagePlaceholder
              ? '36px'
              : '8px'
          }
        >
          <Link to={`/ideas/${slug}?go_back=true`} onClick={handleClick}>
            <Title
              variant="h3"
              mt="4px"
              mb="16px"
              className="e2e-idea-card-title"
            >
              {ideaTitle}
            </Title>
            {!hideBody && <Body idea={idea} />}
          </Link>
        </Box>
        {/* marginTop used to push the interactions/footer to bottom of the card */}
        <Box marginTop="auto">
          <Interactions idea={idea} phase={phaseData || null} />
          <Footer
            idea={idea.data}
            hideIdeaStatus={hideIdeaStatus}
            participationMethod={participationMethod}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default (props: Props) => {
  const { data: idea } = useIdeaById(props.ideaId);

  if (idea) {
    return <IdeaCard idea={idea} {...props} />;
  }

  return null;
};
