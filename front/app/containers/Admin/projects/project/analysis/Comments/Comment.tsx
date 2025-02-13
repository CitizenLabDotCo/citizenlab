import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import useLocalize from 'hooks/useLocalize';

import QuillEditedContent from 'components/UI/QuillEditedContent';

interface Props {
  comment: any;
}

const Comment = ({ comment }: Props) => {
  const localize = useLocalize();

  return (
    <Box
      mb="8px"
      pb="8px"
      key={comment.id}
      borderBottom={`1px solid ${colors.divider}`}
    >
      <QuillEditedContent textColor={colors.textPrimary}>
        <div
          dangerouslySetInnerHTML={{
            __html: localize(comment.attributes.body_multiloc),
          }}
        />
      </QuillEditedContent>
    </Box>
  );
};

export default Comment;
