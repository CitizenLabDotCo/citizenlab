import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import { ICommentData } from 'api/comments/types';

import useLocalize from 'hooks/useLocalize';

import Author from 'components/Author';
import QuillEditedContent from 'components/UI/QuillEditedContent';

interface Props {
  comment: ICommentData;
}

const Comment = ({ comment }: Props) => {
  const localize = useLocalize();

  const authorId = comment.relationships.author.data?.id;
  const { attributes } = comment;

  return (
    <Box
      key={comment.id}
      borderBottom={`1px solid ${colors.divider}`}
      py="16px"
      px="4px"
    >
      <Box>
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
      <Box pt="12px">
        <QuillEditedContent textColor={colors.textPrimary}>
          <div
            dangerouslySetInnerHTML={{
              __html: localize(comment.attributes.body_multiloc),
            }}
          />
        </QuillEditedContent>
      </Box>
    </Box>
  );
};

export default Comment;
