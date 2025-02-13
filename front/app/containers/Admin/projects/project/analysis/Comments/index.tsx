import React from 'react';

import { Accordion, Box, Icon, Title } from '@citizenlab/cl2-component-library';

import useComments from 'api/comments/useComments';

import { useIntl } from 'utils/cl-intl';

import { useSelectedInputContext } from '../SelectedInputContext';

import Comment from './Comment';
import messages from './messages';

interface Props {
  opened: boolean;
  ideaId?: string;
  onChange: (value: boolean) => void;
}

const Comments = ({ opened, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const { selectedInputId } = useSelectedInputContext();

  const { data: comments } = useComments({
    ideaId: opened ? selectedInputId ?? undefined : undefined,
  });

  const commentsList = comments?.pages.flatMap((page) => page.data);

  return (
    <Accordion
      title={
        <Box display="flex" alignItems="center" px="24px" py="12px">
          <Icon height="16px" width="16px" name="comments" mr="8px" />
          <Title variant="h5" m="0">
            {formatMessage(messages.comments)}
          </Title>
        </Box>
      }
      onChange={onChange}
    >
      <Box px="12px" overflowY="scroll" h="200px" w="100%">
        {commentsList?.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </Box>
    </Accordion>
  );
};

export default Comments;
