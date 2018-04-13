import React from 'react';
import IdeasShow from 'containers/IdeasShow';
import GetIdea from 'utils/resourceLoaders/components/GetIdea';
import styled from 'styled-components';

const Container = styled.div`
  background: #fff;
`;

interface Props {
  params: {
    slug: string;
  };
}

export default (props: Props) => (
  <GetIdea slug={props.params.slug}>
    {(idea) => {
      if (!idea) return null;

      return (
        <Container>
          <IdeasShow ideaId={idea.id} />
        </Container>
      );
    }}
  </GetIdea>
);
