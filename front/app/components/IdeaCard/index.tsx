import React, { useEffect } from 'react';

// components
import {
  useBreakpoint,
  Box,
  Title,
  defaultCardStyle,
  defaultCardHoverStyle,
  media,
} from '@citizenlab/cl2-component-library';
import CardImage from './CardImage';
import Body from './Body';
import Footer from './Footer';
import Interactions from './Interactions';
import FollowUnfollow from 'components/FollowUnfollow';

// router
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import clHistory from 'utils/cl-router/history';
import { useSearchParams } from 'react-router-dom';
import Link from 'utils/cl-router/Link';

// types
import { IIdea } from 'api/ideas/types';

// styling
import styled from 'styled-components';

// hooks
import useIdeaById from 'api/ideas/useIdeaById';
import useProjectById from 'api/projects/useProjectById';
import useLocalize from 'hooks/useLocalize';
import usePhase from 'api/phases/usePhase';
import useIdeaImage from 'api/idea_images/useIdeaImage';

// utils
import { scrollToElement } from 'utils/scroll';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';

// events
import eventEmitter from 'utils/eventEmitter';
import { IMAGES_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';

export interface Props {
  ideaId: string;
  phaseId?: string | null;
  className?: string;
  hideImage?: boolean;
  hideImagePlaceholder?: boolean;
  hideIdeaStatus?: boolean;
  showFollowButton?: boolean;
}

const Container = styled(Link)`
  display: block;
  ${defaultCardStyle};
  cursor: pointer;
  ${defaultCardHoverStyle};
  width: 100%;
  display: flex;
  padding: 17px;

  ${media.tablet`
    flex-direction: column;
  `}
`;

const IdeaLoading = (props: Props) => {
  const { data: idea } = useIdeaById(props.ideaId);

  if (idea) {
    return <IdeaCard idea={idea} {...props} />;
  }

  return null;
};

interface IdeaCardProps extends Props {
  idea: IIdea;
}

const IdeaCard = ({
  idea,
  phaseId,
  className,
  hideImage = false,
  hideImagePlaceholder = false,
  hideIdeaStatus = false,
  showFollowButton,
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
  const { data: project } = useProjectById(
    idea.data.relationships.project.data.id
  );
  const { data: phase } = usePhase(phaseId);

  const phaseData = phase?.data;
  const participationMethod = phaseData?.attributes.participation_method;
  const config = participationMethod && getMethodConfig(participationMethod);
  const hideBody = config?.hideAuthorOnIdeas;

  const ideaTitle = localize(idea.data.attributes.title_multiloc);
  const [searchParams] = useSearchParams();
  const scrollToCardParam = searchParams.get('scroll_to_card');

  useEffect(() => {
    if (scrollToCardParam && idea.data.id === scrollToCardParam) {
      const subscription = eventEmitter
        .observeEvent(IMAGES_LOADED_EVENT)
        .subscribe(() => {
          scrollToElement({
            id: scrollToCardParam,
            behavior: 'auto',
            offset: smallerThanPhone ? 150 : 300,
          });

          subscription.unsubscribe();
        });
    }

    removeSearchParams(['scroll_to_card']);
  }, [scrollToCardParam, idea, smallerThanPhone]);

  const { slug } = idea.data.attributes;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    updateSearchParams({ scroll_to_card: idea.data.id });
    clHistory.push(`/ideas/${slug}?go_back=true`, { scrollToTop: true });
  };

  const innerHeight = showFollowButton ? '192px' : '162px';

  return (
    <Container
      className={`e2e-card e2e-idea-card ${className ?? ''}`.trim()}
      id={idea.data.id}
      to={`/ideas/${slug}?go_back=true`}
      onClick={handleClick}
    >
      <CardImage
        phase={phaseData}
        image={image}
        hideImagePlaceholder={hideImagePlaceholder}
        innerHeight={innerHeight}
      />

      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        w="100%"
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
          <Title
            variant="h3"
            mt="4px"
            mb="16px"
            className="e2e-idea-card-title"
          >
            {ideaTitle}
          </Title>
          {!hideBody && <Body idea={idea} />}
        </Box>
        <Box>
          <Interactions idea={idea} phase={phaseData || null} />
          <Footer
            project={project}
            idea={idea.data}
            hideIdeaStatus={hideIdeaStatus}
            participationMethod={participationMethod}
          />
          {showFollowButton && (
            <Box mt="16px" display="flex" justifyContent="flex-end">
              <FollowUnfollow
                followableType="ideas"
                followableId={idea.data.id}
                followersCount={idea.data.attributes.followers_count}
                followerId={idea.data.relationships.user_follower?.data?.id}
                w="auto"
              />
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default IdeaLoading;
