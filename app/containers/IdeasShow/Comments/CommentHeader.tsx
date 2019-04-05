import React, { PureComponent } from 'react';
import { get } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Author from 'components/Author';

// services
import { canModerate } from 'services/permissions/rules/projectPermissions';

// resources
import GetComment, { GetCommentChildProps } from 'resources/GetComment';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetUser, { GetUserChildProps } from 'resources/GetUser';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { FormattedRelative } from 'react-intl';
import messages from '../messages';

// style
import styled from 'styled-components';
import { lighten } from 'polished';
import { colors, fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const Left = styled.div`
  display: flex;
  align-items: center;
`;

const Right = styled.div`
  display: flex;
  align-items: center;
`;

const StyledAuthor = styled(Author)`
  margin-left: -4px;
`;

const TimeAgo = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  line-height: 14px;
  font-weight: 400;
  margin-left: 16px;
`;

const AdminBadge = styled.span`
  color: ${colors.clRed};
  font-size: ${fontSizes.xs}px;
  line-height: 16px;
  border-radius: 5px;
  text-transform: uppercase;
  text-align: center;
  font-weight: 600;
  background-color: ${lighten(.45, colors.clRed)};
  border: none;
  padding: 4px 8px;
  height: 24px;
  display: flex;
  align-items: center;
`;

interface InputProps {
  commentId: string;
}

interface DataProps {
  comment: GetCommentChildProps;
  idea: GetIdeaChildProps;
  author: GetUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class CommentHeader extends PureComponent<Props, State> {
  render() {
    const { comment, idea, author } = this.props;

    if (!isNilOrError(comment) && !isNilOrError(idea)) {
      const projectId = idea.relationships.project.data.id;
      const authorId = (!isNilOrError(author) ? author.id : null);
      const authorCanModerate = !isNilOrError(author) && canModerate(projectId, { data: author });
      const createdAt = comment.attributes.created_at;

      return (
        <Container>
          <Left>
            <StyledAuthor
              authorId={authorId}
              notALink={authorId ? false : true}
              size="34px"
              projectId={projectId}
              showModeration={authorCanModerate}
            />
            <TimeAgo>
              <FormattedRelative value={createdAt} />
            </TimeAgo>
          </Left>

          <Right>
            {authorCanModerate &&
              <AdminBadge>
                <FormattedMessage {...messages.official} />
              </AdminBadge>
            }
          </Right>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  comment: ({ commentId, render }) => <GetComment id={commentId}>{render}</GetComment>,
  idea: ({ comment, render }) => <GetIdea id={get(comment, 'relationships.idea.data.id')}>{render}</GetIdea>,
  author: ({ comment, render }) => <GetUser id={get(comment, 'relationships.author.data.id')}>{render}</GetUser>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <CommentHeader {...inputProps} {...dataProps} />}
  </Data>
);
