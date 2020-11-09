import React, { memo, FormEvent } from 'react';
import { IOpenPostPageModalEvent } from 'containers/App';

// components
import Card from 'components/UI/Card/Compact';

// hooks
import useIdea from 'hooks/useIdea';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';

// utils
import eventEmitter from 'utils/eventEmitter';
import { isNilOrError } from 'utils/helperUtils';

// styles
import styled from 'styled-components';

interface Props {
  ideaId: string;
}

const CompactIdeaCard = memo<Props & InjectedLocalized>(
  ({ ideaId, localize, ...rest }) => {
    const idea = useIdea({ ideaId });

    if (isNilOrError(idea)) {
      return null;
    }

    const onCardClick = (event: FormEvent) => {
      event.preventDefault();

      eventEmitter.emit<IOpenPostPageModalEvent>('cardClick', {
        id: idea.id,
        slug: idea.attributes.slug,
        type: 'idea',
      });
    };

    const ideaTitle = localize(idea.attributes.title_multiloc);
    return (
      <Card
        onClick={onCardClick}
        title={ideaTitle}
        to={`/ideas/${idea.attributes.slug}`}
        {...rest}
      />
    );
  }
);

export default injectLocalize(CompactIdeaCard);
