import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// resources
import { ICommentData } from 'services/comments';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import Link from 'utils/cl-router/Link';
import T from 'components/T';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import CommentHeader from 'containers/IdeasShow/Comments/CommentHeader';
import { get } from 'lodash-es';
import CommentBody from 'containers/IdeasShow/Comments/CommentBody';
import { adopt } from 'react-adopt';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px 40px;
  background: #fff;
  &:not(:last-child) {
    margin-bottom: 20px;
  }
`;

const IdeaLink = styled(Link)`
  background: ${colors.adminBackground};
`;

const CommentContainer = styled.div`
  padding-top: 20px;
  &:not(:last-child) {
    padding-bottom: 20px;
    border-bottom: 1px solid ${colors.separation};
  }
`;

interface InputProps {
  ideaId: string;
  commentsForIdea: ICommentData[];
}

interface DataProps {
  idea: GetIdeaChildProps;
}

const nothingHappens = () => {};

interface Props extends InputProps, DataProps {}

export const reducer = (acc: ICommentData[][], current: ICommentData) => {
  const accLen = acc.length;
  const lastArray = acc[accLen - 1];

  if (lastArray.length === 0) {
    return [[current]];
  }

  if (current.relationships.idea.data.id === lastArray[lastArray.length - 1].relationships.idea.data.id) {
    lastArray.push(current);
    return acc;
  } else {
    acc.push([current]);
    return acc;
  }
};

export class IdeaCommentGroup extends PureComponent<Props> {
  render() {
    const { idea, commentsForIdea } = this.props;

    if (!isNilOrError(idea)) {
      const { slug, title_multiloc } = idea.attributes;
      const projectId = idea.relationships.project.data.id;
      return ((
        <Container>
          <IdeaLink to={`/ideas/${slug}`}>
            <T value={title_multiloc} />
            <FormattedMessage {...messages.seeIdea} />
          </IdeaLink>
          {commentsForIdea.map(comment => {
            const authorId = get(comment, 'relationships.author.data.id', null);
            return (
              <CommentContainer key={comment.id}>
                <CommentHeader
                  projectId={projectId}
                  authorId={authorId}
                  commentId={comment.id}
                  commentType="parent"
                  commentCreatedAt={comment.attributes.created_at}
                  moderator={true}
                />
                <CommentBody
                  commentId={comment.id}
                  commentType="parent"
                  editing={false}
                  moderator={false}
                  onCommentSaved={nothingHappens}
                  onCancelEditing={nothingHappens}
                />
              </CommentContainer>
          );
        })}
        </Container>
      ));
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  idea: ({ ideaId, render }) =>  <GetIdea id={ideaId}>{render}</GetIdea>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaCommentGroup {...inputProps} {...dataProps} />}
  </Data>
);
