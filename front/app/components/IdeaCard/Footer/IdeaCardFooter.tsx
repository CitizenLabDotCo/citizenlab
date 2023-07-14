import React, { FormEvent } from 'react';

// components
import CommentCount from './CommentCount';

// router
import clHistory from 'utils/cl-router/history';

// types
import { IIdeaData } from 'api/ideas/types';

// styles
import styled from 'styled-components';
import { Button, colors } from '@citizenlab/cl2-component-library';
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

const Footer = styled.footer`
  display: flex;
  justify-content: space-between;
  margin-right: auto;
  margin-left: auto;
  margin-top: 16px;
`;

interface Props {
  idea: IIdeaData;
  showCommentCount: boolean;
}

const IdeaCardFooter = ({ idea, showCommentCount }: Props) => {
  const { formatMessage } = useIntl();

  const onReadMoreClick = (event: FormEvent) => {
    event.preventDefault();
    clHistory.push(`/ideas/${idea.attributes.slug}`);
  };

  return (
    <Footer>
      <Button
        size="s"
        textColor={colors.coolGrey700}
        mr="8px"
        ml="auto"
        m="0px"
        p="0px"
        buttonStyle="text"
        onClick={onReadMoreClick}
      >
        <u>{formatMessage(messages.readMore)}</u>
      </Button>
      {showCommentCount && (
        <CommentCount commentCount={idea.attributes.comments_count} />
      )}
    </Footer>
  );
};
export default IdeaCardFooter;
