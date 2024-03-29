import React from 'react';

import { Segment, Header } from 'semantic-ui-react';

import useIdeaById from 'api/ideas/useIdeaById';

import T from 'components/T';

import { handlePreviewCLick, StyledLink } from './';

interface Props {
  postId: string;
  openPreview: (id: string) => void;
}

const InfoSidebarSingle = ({ postId, openPreview }: Props) => {
  const { data: post } = useIdeaById(postId);

  if (post) {
    return (
      <Segment attached="bottom">
        <StyledLink onClick={handlePreviewCLick(post.data.id, openPreview)}>
          <Header as="h5">
            <T value={post.data.attributes.title_multiloc} />
          </Header>
        </StyledLink>
        <p>
          <T value={post.data.attributes.body_multiloc} supportHtml={true} />
        </p>
      </Segment>
    );
  }

  return null;
};

export default InfoSidebarSingle;
