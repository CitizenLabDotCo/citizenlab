import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IIdeaData } from 'api/ideas/types';

import clHistory from 'utils/cl-router/history';

import CommentCount from './CommentCount';
import ReadMoreButton from './ReadMoreButton';

interface Props {
  idea: IIdeaData;
  showCommentCount: boolean;
}

const VotingFooter = ({ idea, showCommentCount }: Props) => {
  return (
    <Box as="footer" w="100%" display="flex" mt="16px" justifyContent="center">
      <ReadMoreButton
        onClick={() => {
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          clHistory.push(`/ideas/${idea?.attributes.slug}?go_back=true`, {
            scrollToTop: true,
          });
        }}
      />
      {showCommentCount && (
        <CommentCount commentCount={idea.attributes.comments_count} />
      )}
    </Box>
  );
};
export default VotingFooter;
