import React, { PureComponent, FormEvent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import { get } from 'lodash-es';

// resources & typings
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetUser, { GetUserChildProps } from 'resources/GetUser';

// permissions
import { canModerate } from 'services/permissions/rules/projectPermissions';

// typings
import { ICommentData } from 'services/comments';
import { IModalInfo } from 'containers/App';

// utils
import eventEmitter from 'utils/eventEmitter';

// style
import styled from 'styled-components';
import { colors, media } from 'utils/styleUtils';
import { darken } from 'polished';

// Components
import Icon from 'components/UI/Icon';
import Link from 'utils/cl-router/Link';
import CommentHeader from 'containers/IdeasShow/Comments/CommentHeader';
import CommentBody from 'containers/IdeasShow/Comments/CommentBody';
import CommentVote from 'containers/IdeasShow/Comments/CommentVote';

// intl
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px 40px 40px;
  background: #fff;
  box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.05);
  &:not(:last-child) {
    margin-bottom: 20px;
  }

  ${media.smallerThanMinTablet`
    padding: 17px 30px 30px;
  `}
`;

const IdeaLink = styled(Link)`
  background: ${colors.background};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 7px 17px;
  svg {
    height: 20px;
    width: 14px;
    margin-right: 10px;
  }
  &:hover, &:focus {
    background: ${darken(.02, colors.background)};
  }
`;

const IdeaLinkLeft = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  color: ${({ theme }) => theme.colorText};
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-right: 10px;
  min-width: 0px;
  > span {
    text-overflow: ellipsis;
    overflow: hidden;
  }
`;
const IdeaLinkRight = styled.div`
  color: ${colors.label};
  text-decoration: underline;
  white-space: nowrap;
`;

const StyledCommentVote = styled(CommentVote)`
  margin-top: 15px;
`;

const CommentContainer = styled.div`
  padding-top: 27px;
  &:not(:last-child) {
    padding-bottom: 27px;
    border-bottom: 1px solid ${colors.separation};
  }
`;

interface InputProps {
  ideaId: string;
  commentsForIdea: ICommentData[];
  userId: string;
}

interface DataProps {
  idea: GetIdeaChildProps;
  user: GetUserChildProps;
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

export const componentName = 'containers/UsersShowPage/IdeaCommentGroup';

export class IdeaCommentGroup extends PureComponent<Props> {

  onIdeaLinkClick = (event: FormEvent<any>) => {
    event.preventDefault();

    const { idea } = this.props;

    if (!isNilOrError(idea)) {
      eventEmitter.emit<IModalInfo>(componentName, 'ideaCardClick', {
        type: 'idea',
        id: idea.id,
        url: `/ideas/${idea.attributes.slug}`
      });
    }
  }

  render() {
    const { idea, commentsForIdea, userId, user } = this.props;

    if (!isNilOrError(idea) && !isNilOrError(user)) {
      const { slug, title_multiloc } = idea.attributes;
      const projectId = idea.relationships.project.data.id;
      const votingEnabled = (!isNilOrError(idea) ? get(idea.relationships.action_descriptor.data.voting, 'enabled', false) : false);
      return ((
        <Container>
          <IdeaLink
            to={`/ideas/${slug}`}
            onClick={this.onIdeaLinkClick}
          >
            <IdeaLinkLeft>
              <Icon name="lightBulb" />
              <T value={title_multiloc} />
            </IdeaLinkLeft>
            <IdeaLinkRight>
              <FormattedMessage {...messages.seeIdea} />
            </IdeaLinkRight>
          </IdeaLink>
          {commentsForIdea.map(comment => {
            return (
              <CommentContainer key={comment.id}>
                <CommentHeader
                  projectId={projectId}
                  authorId={userId}
                  commentId={comment.id}
                  commentType="parent"
                  commentCreatedAt={comment.attributes.created_at}
                  moderator={canModerate(projectId, { data: user })}
                />
                <CommentBody
                  commentId={comment.id}
                  commentType="parent"
                  editing={false}
                  moderator={canModerate(projectId, { data: user })}
                  onCommentSaved={nothingHappens}
                  onCancelEditing={nothingHappens}
                />
                <StyledCommentVote
                  ideaId={get(comment, 'relationships.idea.data.id')}
                  commentId={comment.id}
                  commentType={undefined}
                  votingEnabled={votingEnabled}
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
  idea: ({ ideaId, render }) =>  <GetIdea id={ideaId}>{render}</GetIdea>,
  user: ({ userId, render }) =>  <GetUser id={userId}>{render}</GetUser>
});

const WrappedIdeaComments = (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaCommentGroup {...inputProps} {...dataProps} />}
  </Data>
);

export default WrappedIdeaComments;
