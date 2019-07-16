import React, { PureComponent, FormEvent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// resources & typings
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetUser, { GetUserChildProps } from 'resources/GetUser';

// permissions
import { canModerate } from 'services/permissions/rules/projectPermissions';

// typings
import { ICommentData } from 'services/comments';
import { IOpenPostPageModalEvent } from 'containers/App';

// utils
import eventEmitter from 'utils/eventEmitter';

// style
import styled from 'styled-components';
import { colors, media, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';

// Components
import Icon from 'components/UI/Icon';
import Link from 'utils/cl-router/Link';
import CommentHeader from 'containers/IdeasShow/Comments/CommentHeader';
import CommentBody from 'containers/IdeasShow/Comments/CommentBody';

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
  border-radius: ${({ theme }) => theme.borderRadius};
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

const VoteIcon: any = styled(Icon)`
  height: 18px;
  width: 20px;
  fill: ${({ theme }) => theme.colorText};
  position: absolute;
  top: -1px;
`;

const IconContainer = styled.div`
  position: relative;
  width: 20px;
  margin-right: 5px;
`;

const Votes = styled.div`
  font-size: ${fontSizes.large};
  font-weight: 600;
  color:  ${({ theme }) => theme.colorText};
`;

const VotesContainer = styled.div`
  margin-top: 15px;
  display: flex;
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

export class IdeaCommentGroup extends PureComponent<Props> {

  onIdeaLinkClick = (event: FormEvent<any>) => {
    event.preventDefault();

    const { idea } = this.props;

    if (!isNilOrError(idea)) {
      eventEmitter.emit<IOpenPostPageModalEvent>('IdeaCommentGroup', 'cardClick', {
        id: idea.id,
        slug: idea.attributes.slug,
        type: 'initiative'
      });
    }
  }

  render() {
    const { idea, commentsForIdea, userId, user } = this.props;

    if (!isNilOrError(idea) && !isNilOrError(user)) {
      const { slug, title_multiloc } = idea.attributes;
      const projectId = idea.relationships.project.data.id;
      return (
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
                  onCommentSaved={nothingHappens}
                  onCancelEditing={nothingHappens}
                />
                <VotesContainer>
                  <IconContainer>
                    <VoteIcon name="upvote"/>
                  </IconContainer>
                  <Votes>
                    {comment.attributes.upvotes_count}
                  </Votes>
                </VotesContainer>
              </CommentContainer>
            );
          })}
        </Container>
      );
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
