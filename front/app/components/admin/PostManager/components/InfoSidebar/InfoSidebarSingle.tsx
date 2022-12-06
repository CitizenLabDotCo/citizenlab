import React from 'react';
import { Segment, Header } from 'semantic-ui-react';
import GetIdea from 'resources/GetIdea';
import { isNilOrError } from 'utils/helperUtils';
import T from 'components/T';
import { handlePreviewCLick, StyledLink } from './';

export default (props: {
  postId: string;
  openPreview: (id: string) => void;
}) => (
  <GetIdea ideaId={props.postId}>
    {(post) => {
      if (isNilOrError(post)) return null;

      return (
        <Segment attached="bottom">
          <StyledLink onClick={handlePreviewCLick(post.id, props.openPreview)}>
            <Header as="h5">
              <T value={post.attributes.title_multiloc} />
            </Header>
          </StyledLink>
          <p>
            <T value={post.attributes.body_multiloc} supportHtml={true} />
          </p>
        </Segment>
      );
    }}
  </GetIdea>
);
