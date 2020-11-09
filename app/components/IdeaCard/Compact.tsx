import React, { memo, FormEvent } from 'react';
import { IOpenPostPageModalEvent } from 'containers/App';

// components
import Card from 'components/UI/Card/Compact';
import Avatar from 'components/Avatar';

// hooks
import useIdea from 'hooks/useIdea';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';

// utils
import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';
import { truncate } from 'utils/textUtils';

// styles
import styled from 'styled-components';

const BodyWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const StyledAvatar = styled(Avatar)`
  margin-right: 12px;
`;

const Body = styled.div`
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
`;

interface Props {
  ideaId: string;
}

const CompactIdeaCard = memo<Props & InjectedLocalized>(
  ({ ideaId, localize, ...rest }) => {
    const idea = useIdea({ ideaId });

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

    const body = (
      <BodyWrapper>
        {authorId && <StyledAvatar size="36" userId={authorId} />}
        <Body>{truncate(bodyText, 100)}</Body>
      </BodyWrapper>
    );
    return (
      <Card
        onClick={onCardClick}
        title={localize(idea.attributes.title_multiloc)}
        body={body}
        to={`/ideas/${idea.attributes.slug}`}
        {...rest}
      />
    );
  }
);

export default injectLocalize(CompactIdeaCard);
