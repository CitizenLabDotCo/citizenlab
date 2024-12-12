import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useSimilarIdeas from 'api/ideas/useSimilarIdeas';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from './messages';
import { Header, Item } from './MetaInfoStyles';

const Container = styled.div``;

interface Props {
  ideaId: string;
  className?: string;
}

const SimilarIdeas = ({ ideaId, className }: Props) => {
  const { data: similarIdeas } = useSimilarIdeas(ideaId);
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  if (similarIdeas) {
    return (
      <Item className={className || ''}>
        <Header>{formatMessage(messages.similar)}</Header>
        <Container className={className}>
          {Array.isArray(similarIdeas.data) &&
            similarIdeas.data.map((similarIdea) => (
              <Box key={similarIdea.id}>
                <Link
                  key={similarIdea.id}
                  to={`/ideas/${similarIdea.attributes.slug}`}
                >
                  {localize(similarIdea.attributes.title_multiloc)}
                </Link>
              </Box>
            ))}
        </Container>
      </Item>
    );
  }
  return null;
};

export default SimilarIdeas;
