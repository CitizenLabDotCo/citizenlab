import React, { FormEvent } from 'react';

// components
import CommentCount from './CommentCount';

// types
import { IIdea } from 'api/ideas/types';

// styles
import styled from 'styled-components';
import {
  Button,
  colors,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { IOpenPostPageModalEvent } from 'containers/App';
import eventEmitter from 'utils/eventEmitter';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

const Footer = styled.footer`
  display: flex;
  justify-content: space-between;
  margin-right: auto;
  margin-left: auto;
  margin-top: 16px;
`;

interface Props {
  idea: IIdea;
  showCommentCount: boolean;
}

const IdeaCardFooter = ({ idea, showCommentCount }: Props) => {
  const { formatMessage } = useIntl();
  const isSmallerThanTablet = useBreakpoint('tablet');

  const onReadMoreClick = (event: FormEvent) => {
    event.preventDefault();

    eventEmitter.emit<IOpenPostPageModalEvent>('cardClick', {
      id: idea.data.id,
      slug: idea.data.attributes.slug,
      type: 'idea',
    });
  };

  console.log({ isSmallerThanTablet });
  return (
    <Footer>
      {isSmallerThanTablet && (
        <Button
          size="s"
          textColor={colors.blue400}
          mr="8px"
          ml="auto"
          m="0px"
          p="0px"
          buttonStyle="text"
          onClick={onReadMoreClick}
        >
          <u>{formatMessage(messages.readMore)}</u>
        </Button>
      )}
      {showCommentCount && (
        <CommentCount commentCount={idea.data.attributes.comments_count} />
      )}
    </Footer>
  );
};
export default IdeaCardFooter;
