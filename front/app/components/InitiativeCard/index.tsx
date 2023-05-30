import React, { FormEvent } from 'react';
import { get, isString } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// components
import Card from 'components/UI/Card';
import { Icon } from '@citizenlab/cl2-component-library';
import Author from 'components/Author';
import VoteIndicator from './VoteIndicator';

// utils
import eventEmitter from 'utils/eventEmitter';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// styles
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';

// typings
import { IOpenPostPageModalEvent } from 'containers/App';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useUserById from 'api/users/useUserById';
import useInitiativeImage from 'api/initiative_images/useInitiativeImage';

const StyledAuthor = styled(Author)`
  margin-left: -4px;
`;

const FooterInner = styled.div`
  width: 100%;
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 20px;
  padding-right: 20px;
  margin-bottom: 20px;
`;

const Spacer = styled.div`
  flex: 1;
`;

const CommentIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  margin-right: 6px;
  margin-top: 2px;
`;

const CommentCount = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
`;

const CommentInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export interface Props {
  initiativeId: string;
  className?: string;
}

const InitiativeCard = ({
  localize,
  className,
  initiativeId,
}: Props & InjectedLocalized) => {
  const { data: initiative } = useInitiativeById(initiativeId);
  const authorId = get(initiative, 'data.relationships.author.data.id');
  const { data: initiativeAuthor } = useUserById(authorId);
  const initiativeImageId = get(
    initiative,
    'data.relationships.initiative_images.data[0].id'
  );
  const { data: initiativeImage } = useInitiativeImage(
    initiativeId,
    initiativeImageId
  );

  if (!initiative || isNilOrError(initiativeAuthor)) return null;

  const onCardClick = (event: FormEvent) => {
    event.preventDefault();

    if (!isNilOrError(initiative)) {
      eventEmitter.emit<IOpenPostPageModalEvent>('cardClick', {
        id: initiativeId,
        slug: initiative.data.attributes.slug,
        type: 'initiative',
      });
    }
  };

  const initiativeTitle = localize(initiative.data.attributes.title_multiloc);
  const initiativeAuthorId = initiativeAuthor ? initiativeAuthor.data.id : null;
  const initiativeImageUrl: string | null = get(
    initiativeImage,
    'data.attributes.versions.medium',
    null
  );
  const commentsCount = initiative.data.attributes.comments_count;
  const cardClassNames = [
    className,
    'e2e-initiative-card',
    get(initiative, 'relationships.user_vote.data') ? 'voted' : 'not-voted',
    commentsCount > 0 ? 'e2e-has-comments' : null,
  ]
    .filter((item) => isString(item) && item !== '')
    .join(' ');

  return (
    <Card
      className={cardClassNames}
      onClick={onCardClick}
      to={`/initiatives/${initiative.data.attributes.slug}`}
      imageUrl={initiativeImageUrl}
      title={initiativeTitle}
      body={
        <StyledAuthor
          authorId={initiativeAuthorId}
          createdAt={initiative.data.attributes.published_at}
          size={34}
        />
      }
      footer={
        <FooterInner>
          <VoteIndicator initiativeId={initiativeId} />
          <Spacer />
          <CommentInfo>
            <CommentIcon name="comments" ariaHidden />
            <CommentCount
              aria-hidden
              className="e2e-initiativecard-comment-count"
            >
              {commentsCount}
            </CommentCount>
            <ScreenReaderOnly>
              <FormattedMessage
                {...messages.xComments}
                values={{ commentsCount }}
              />
            </ScreenReaderOnly>
          </CommentInfo>
        </FooterInner>
      }
    />
  );
};

export default injectLocalize(InitiativeCard);
