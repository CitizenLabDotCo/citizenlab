import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import GetIdea from 'resources/GetIdea';
import T from 'components/T';
import { Segment, Header } from 'semantic-ui-react';
import { handlePreviewCLick, StyledLink } from './';

export default (props: { ideaId: string, openPreview: (id: string) => void }) => (
  <GetIdea id={props.ideaId}>
    {(idea) =>  {
      if (isNilOrError(idea)) return null;

      return (
        <Segment attached="bottom">
          <StyledLink onClick={handlePreviewCLick(idea.id, props.openPreview)}>
            <Header as="h5">
              <T value={idea.attributes.title_multiloc} />
            </Header>
          </StyledLink>
          <p>
            <T value={idea.attributes.body_multiloc} supportHtml={true} />
          </p>
        </Segment>
      );
    }}
  </GetIdea>
);
