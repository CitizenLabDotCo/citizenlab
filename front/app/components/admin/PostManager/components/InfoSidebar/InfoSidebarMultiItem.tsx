import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import T from 'components/T';
import { List } from 'semantic-ui-react';
import GetIdeaById from 'resources/GetIdeaById';
import { handlePreviewCLick, StyledLink } from './';

export default (props: {
  postId: string;
  openPreview: (id: string) => void;
}) => (
  <GetIdeaById ideaId={props.postId}>
    {(post) => {
      if (isNilOrError(post)) return null;

      return (
        <List.Item>
          <StyledLink
            onClick={handlePreviewCLick(props.postId, props.openPreview)}
          >
            <T value={post.attributes.title_multiloc} />
          </StyledLink>
        </List.Item>
      );
    }}
  </GetIdeaById>
);
