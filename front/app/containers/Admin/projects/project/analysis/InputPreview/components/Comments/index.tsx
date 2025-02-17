import React, { useMemo } from 'react';

import { Box, Title } from '@citizenlab/cl2-component-library';

import useComments from 'api/comments/useComments';

import { useIntl } from 'utils/cl-intl';

import { useSelectedInputContext } from '../../../SelectedInputContext';

import Comment from './Comment';
import messages from './messages';

const Comments = () => {
  const { formatMessage } = useIntl();
  const { selectedInputId } = useSelectedInputContext();

  const { data: comments } = useComments({
    ideaId: selectedInputId ?? undefined,
  });

  const topLevelComments = useMemo(() => {
    if (!comments) return;
    const commentsList = comments.pages.flatMap((page) => page.data);
    return commentsList.filter((comment) => !comment.relationships.parent.data);
  }, [comments]);

  return (
    <Box>
      <Title variant="h4">{formatMessage(messages.comments)}</Title>
      <Box>
        {topLevelComments?.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </Box>
    </Box>
  );
};

export default Comments;
