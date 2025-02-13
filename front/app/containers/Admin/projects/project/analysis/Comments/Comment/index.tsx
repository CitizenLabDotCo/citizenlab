import React from 'react';

import { Box, Button, colors } from '@citizenlab/cl2-component-library';

import useLocalize from 'hooks/useLocalize';

import QuillEditedContent from 'components/UI/QuillEditedContent';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  comment: any;
}

const Comment = ({ comment }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

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
      <Button buttonStyle="text" onClick={() => {}}>
        {formatMessage(messages.showSubComments)}
      </Button>
    </Box>
  );
};

export default Comment;
