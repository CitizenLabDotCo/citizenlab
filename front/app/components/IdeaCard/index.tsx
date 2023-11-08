import React, { memo, useEffect } from 'react';

// components
import { useBreakpoint, Box, Title } from '@citizenlab/cl2-component-library';
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
import {
  defaultCardStyle,
  defaultCardHoverStyle,
  media,
} from 'utils/styleUtils';

// hooks
import useIdeaById from 'api/ideas/useIdeaById';
import useProjectById from 'api/projects/useProjectById';
import useLocalize from 'hooks/useLocalize';
import usePhase from 'api/phases/usePhase';
import useBasket from 'api/baskets/useBasket';

// utils
import { scrollToElement } from 'utils/scroll';
import { pastPresentOrFuture } from 'utils/dateUtils';
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
  goBackMode?: 'browserGoBackButton' | 'goToProject';
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

const IdeaCard = memo<IdeaCardProps>(
  ({
    idea,
    phaseId,
    className,
    hideImage = false,
    hideImagePlaceholder = false,
    hideIdeaStatus = false,
    goBackMode = 'browserGoBackButton',
    showFollowButton,
  }) => {
    const isGeneralIdeasPage = window.location.pathname.endsWith('/ideas');
    const smallerThanPhone = useBreakpoint('phone');
    const smallerThanTablet = useBreakpoint('tablet');
    const localize = useLocalize();
    const { data: project } = useProjectById(
      idea.data.relationships.project.data.id
    );
    const { data: phase } = usePhase(phaseId);

    const participationContext = phase?.data || project?.data;
    const participationMethod =
      participationContext?.attributes.participation_method;
    const config = participationMethod && getMethodConfig(participationMethod);
    const hideBody = config?.hideAuthorOnIdeas;

    const participationContextEnded =
      participationContext?.type === 'phase' &&
      pastPresentOrFuture(participationContext?.attributes?.end_at) === 'past';
    const { data: basket } = useBasket(
      participationContext?.relationships?.user_basket?.data?.id
    );

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
    const params = goBackMode === 'browserGoBackButton' ? '?go_back=true' : '';

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      updateSearchParams({ scroll_to_card: idea.data.id });
      clHistory.push(`/ideas/${slug}${params}`);
    };

    const hideInteractions =
      isGeneralIdeasPage ||
      (participationContextEnded &&
        basket?.data.attributes.submitted_at === null)
        ? true
        : false;

    const innerHeight = showFollowButton ? '192px' : '162px';

    return (
      <Container
        className={`e2e-card e2e-idea-card ${className ?? ''}`.trim()}
        id={idea.data.id}
        to={`/ideas/${slug}${params}`}
        onClick={handleClick}
      >
        <CardImage
          idea={idea}
          participationContext={participationContext}
          hideImage={hideImage}
          hideImagePlaceholder={hideImagePlaceholder}
          innerHeight={innerHeight}
        />

        <Box
          ml="12px"
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
        >
          <Box mb={smallerThanTablet ? '24px' : undefined}>
            <Title variant="h3" mt="4px" mb="16px">
              {ideaTitle}
            </Title>
            {!hideBody && <Body idea={idea} />}
          </Box>
          <Box>
            {!hideInteractions && (
              <Interactions
                idea={idea}
                participationContext={participationContext}
              />
            )}
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
  }
);

export default IdeaLoading;
