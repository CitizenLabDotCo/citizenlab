import React, { memo, useEffect } from 'react';

// components
import Card from 'components/UI/Card/Compact';
import { Icon, useBreakpoint } from '@citizenlab/cl2-component-library';
import Body from './Body';
import Footer from './Footer';

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
import { isNilOrError } from 'utils/helperUtils';
import { scrollToElement } from 'utils/scroll';
import { getInteractions } from './utils';
import { pastPresentOrFuture } from 'utils/dateUtils';
import { getMethodConfig } from 'utils/configs/participationMethodUtils';

// events
import eventEmitter from 'utils/eventEmitter';
import { IMAGES_LOADED_EVENT } from 'components/admin/ContentBuilder/constants';

// styles
import styled from 'styled-components';
import { transparentize } from 'polished';
import { colors } from 'utils/styleUtils';

const ImagePlaceholderContainer = styled.div`
  width: 100%;
  height: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${transparentize(0.94, colors.textSecondary)};
`;

const ImagePlaceholderIcon = styled(Icon)`
  width: 80px;
  height: 80px;
  fill: ${transparentize(0.62, colors.textSecondary)};
`;

interface Props {
  ideaId: string;
  phaseId?: string | null;
  className?: string;
  hideImage?: boolean;
  hideImagePlaceholder?: boolean;
  hideIdeaStatus?: boolean;
  goBackMode?: 'browserGoBackButton' | 'goToProject';
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
        className={[className, 'e2e-idea-card']
          .filter((item) => typeof item === 'string' && item !== '')
          .join(' ')}
        title={ideaTitle}
        to={`/ideas/${slug}${params}`}
        onClick={handleClick}
        image={
          !isNilOrError(ideaImage)
            ? ideaImage.data.attributes.versions.medium
            : null
        }
        imagePlaceholder={
          <ImagePlaceholderContainer>
            <ImagePlaceholderIcon
              name={
                participationMethod === 'voting' && votingMethod === 'budgeting'
                  ? 'money-bag'
                  : 'idea'
              }
            />
          </ImagePlaceholderContainer>
        }
        hideImage={hideImage}
        hideImagePlaceholder={hideImagePlaceholder}
        body={<Body idea={idea} />}
        hideBody={hideBody}
        interactions={
          hideInteractions
            ? null
            : getInteractions({
                participationContext,
                idea,
              })
        }
        footer={
          <Footer
            project={project}
            idea={idea}
            hideIdeaStatus={hideIdeaStatus}
            participationMethod={participationMethod}
          />
        }
      />
    );
  }
);

export default IdeaLoading;
