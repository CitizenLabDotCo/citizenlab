import React, { memo, useEffect } from 'react';

// components
import Card from 'components/UI/Card/Compact';
import { useBreakpoint, Box } from '@citizenlab/cl2-component-library';
import Body from './Body';
import ImagePlaceholder from './ImagePlaceholder';
import Footer from './Footer';
import Interactions from './Interactions';
import FollowUnfollow from 'components/FollowUnfollow';

// router
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import clHistory from 'utils/cl-router/history';
import { useSearchParams } from 'react-router-dom';

// types
import { IIdea } from 'api/ideas/types';

// hooks
import useIdeaById from 'api/ideas/useIdeaById';
import useIdeaImage from 'api/idea_images/useIdeaImage';
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

interface Props {
  ideaId: string;
  phaseId?: string | null;
  className?: string;
  hideImage?: boolean;
  hideImagePlaceholder?: boolean;
  hideIdeaStatus?: boolean;
  goBackMode?: 'browserGoBackButton' | 'goToProject';
  showFollowButton?: boolean;
}

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
    const localize = useLocalize();
    const { data: project } = useProjectById(
      idea.data.relationships.project.data.id
    );
    const { data: phase } = usePhase(phaseId);
    const { data: ideaImage } = useIdeaImage(
      idea.data.id,
      idea.data.relationships.idea_images.data?.[0]?.id
    );

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
    const votingMethod = participationContext?.attributes.voting_method;

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

    return (
      <Card
        id={idea.data.id}
        className={`${className ?? ''} e2e-idea-card`.trim()}
        to={`/ideas/${slug}${params}`}
        onClick={handleClick}
        title={ideaTitle}
        image={hideImage ? null : ideaImage?.data.attributes.versions.medium}
        imagePlaceholder={
          hideImagePlaceholder ? undefined : (
            <ImagePlaceholder
              participationMethod={participationMethod}
              votingMethod={votingMethod}
            />
          )
        }
        innerHeight={showFollowButton ? '192px' : undefined}
        body={hideBody ? undefined : <Body idea={idea} />}
        interactions={
          hideInteractions ? null : (
            <Interactions
              idea={idea}
              participationContext={participationContext}
            />
          )
        }
        footer={
          <>
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
          </>
        }
      />
    );
  }
);

export default IdeaLoading;
