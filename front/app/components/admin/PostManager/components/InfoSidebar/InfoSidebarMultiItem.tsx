import React from 'react';
import T from 'components/T';
import { List } from 'semantic-ui-react';
import useIdeaById from 'api/ideas/useIdeaById';
import { handlePreviewCLick, StyledLink } from './';

interface Props {
  postId: string;
  openPreview: (id: string) => void;
}

const InfoSidebarMultiItem = ({ postId, openPreview }: Props) => {
  const { data: post } = useIdeaById(postId);

  if (post) {
    return (
      <List.Item>
        <StyledLink onClick={handlePreviewCLick(postId, openPreview)}>
          <T value={post.data.attributes.title_multiloc} />
        </StyledLink>
      </List.Item>
    );
  }

  return null;
};

export default InfoSidebarMultiItem;
