import React, { memo, FormEvent } from 'react';
import { IOpenPostPageModalEvent } from 'containers/App';

// components
import Card from 'components/UI/Card/Compact';
import Avatar from 'components/Avatar';
import ideaImagePlaceholder from './idea-placeholder.png';

// hooks
import useIdea from 'hooks/useIdea';
import useIdeaImage from 'hooks/useIdeaImage';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';

// utils
import { get } from 'lodash-es';
import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';
import { truncate } from 'utils/textUtils';

// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import VoteControl from 'components/VoteControl';

const BodyWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const StyledAvatar = styled(Avatar)`
  margin-right: 8px;
`;

const Body = styled.div`
  font-size: ${fontSizes.small}px;
  color: ${colors.label};
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;

const Footer = styled.footer`
  display: flex;
`;

interface Props {
  ideaId: string;
}

const CompactIdeaCard = memo<Props & InjectedLocalized>(
  ({ ideaId, localize, ...rest }) => {
    const idea = useIdea({ ideaId });

    const ideaImage = useIdeaImage({
      ideaId,
      ideaImageId: get(idea, 'relationships.idea_images.data[0].id'),
    });

    if (isNilOrError(idea)) {
      return null;
    }
    console.log(idea);
    const onCardClick = (event: FormEvent) => {
      event.preventDefault();

      eventEmitter.emit<IOpenPostPageModalEvent>('cardClick', {
        id: idea.id,
        slug: idea.attributes.slug,
        type: 'idea',
      });
    };

    const authorId = idea.relationships.author.data?.id;
    // remove html tags from wysiwyg output
    const bodyText = localize(idea.attributes.body_multiloc)
      .replace(/<[^>]*>?/gm, '')
      .trim();

    const votingDescriptor = idea?.attributes?.action_descriptor?.voting_idea;

    console.log(ideaImage);
    return (
      <Card
        onClick={onCardClick}
        title={localize(idea.attributes.title_multiloc)}
        to={`/ideas/${idea.attributes.slug}`}
        image={
          !isNilOrError(ideaImage)
            ? ideaImage.attributes.versions.small
            : ideaImagePlaceholder
        }
        body={
          <BodyWrapper>
            {authorId && <StyledAvatar size="36" userId={authorId} />}
            <Body>{truncate(bodyText, 55)}</Body>
          </BodyWrapper>
        }
        footer={
          <Footer>
            <VoteControl
              style="compact"
              ideaId={idea.id}
              size="1"
              ariaHidden={true}
              showDownvote={votingDescriptor?.downvoting_enabled}
            />
          </Footer>
        }
        {...rest}
      />
    );
  }
);

export default injectLocalize(CompactIdeaCard);
