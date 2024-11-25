import React from 'react';

import { useIntl, WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';

import useSimilarIdeas from 'api/ideas/useSimilarIdeas';

import useLocalize from 'hooks/useLocalize';

import messages from './messages';
import { Header, Item } from './MetaInfoStyles';

const Container = styled.div``;

interface Props {
  ideaId: string;
  className?: string;
}

const SimilarIdeas = ({ ideaId, className }: Props & WrappedComponentProps) => {
  const { data: similarIdeas } = useSimilarIdeas(ideaId);
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  if (similarIdeas) {
    return (
      <Item className={className || ''}>
        <Header>{formatMessage(messages.similarIdeas)}</Header>
        <Container className={className}>
          {Array.isArray(similarIdeas.data) &&
            similarIdeas.data.map((similarIdea) => (
              <p key={similarIdea.id}>
                {localize(similarIdea.attributes.title_multiloc)}
              </p>
            ))}
        </Container>
      </Item>
    );
  }
  return null;
};

export default SimilarIdeas;
