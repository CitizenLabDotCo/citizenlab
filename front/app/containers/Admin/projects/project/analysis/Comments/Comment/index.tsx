import React from 'react';

import { Box, Button, colors } from '@citizenlab/cl2-component-library';

import { ICommentData } from 'api/comments/types';

import useLocalize from 'hooks/useLocalize';

import Author from 'components/Author';
import QuillEditedContent from 'components/UI/QuillEditedContent';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  comment: ICommentData;
}

const Comment = ({ comment }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const authorId = comment.relationships.author.data?.id;
  const { attributes } = comment;

  return (
    <Box mb="8px" key={comment.id} borderBottom={`1px solid ${colors.divider}`}>
      <Box mb="8px">
        <Author
          authorId={authorId ?? null}
          authorHash={
            attributes.publication_status === 'published'
              ? attributes.author_hash
              : undefined
          }
          isLinkToProfile={typeof authorId === 'string'}
          createdAt={attributes.created_at}
          size={30}
          showModeratorStyles={false}
        />
      </Box>
      <QuillEditedContent textColor={colors.textPrimary}>
        <div
          dangerouslySetInnerHTML={{
            __html: localize(comment.attributes.body_multiloc),
          }}
        />
      </QuillEditedContent>
      <Button buttonStyle="text" onClick={() => {}}>
        {formatMessage(messages.showSubComments)}
      </Button>
    </Box>
  );
};

export default Comment;
