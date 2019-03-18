// libraries
import React from 'react';
import { adopt } from 'react-adopt';

// resources
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetComments, { GetCommentsChildProps } from 'resources/GetComments';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';
import HasPermission from 'components/HasPermission';

// components
import ParentCommentForm from './ParentCommentForm';
import Comments from './CommentsContainer';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const CommentsTitle = styled.h2`
  color: ${colors.text};
  font-size: ${fontSizes.xxl}px;
  line-height: 38px;
  font-weight: 500;
  margin: 0;
  padding: 0;
  margin-bottom: 20px;
`;

interface InputProps {
  ideaId: string;
}

interface DataProps {
  idea: GetIdeaChildProps;
  project: GetProjectChildProps;
  ideaComments: GetCommentsChildProps;
}

interface Props extends InputProps, DataProps { }

const CommentsSection: React.SFC<Props> = ({
  ideaId,
  ideaComments,
  project,
}) => {
    return (
      <>
      {!isNilOrError(ideaComments) && ideaComments.filter(comment => comment.attributes.publication_status !== 'deleted').length > 0 ?
        <CommentsTitle>
          <FormattedMessage {...messages.commentsTitle} />
        </CommentsTitle>
        :
        <HasPermission item={!isNilOrError(project) ? project : null} action="moderate">
          <HasPermission.No>
            <CommentsTitle>
              <FormattedMessage {...messages.commentsTitle} />
            </CommentsTitle>
          </HasPermission.No>
        </HasPermission>
      }

      {!isNilOrError(project) &&
        <HasPermission item={project} action="moderate">
          <HasPermission.No>
            <ParentCommentForm ideaId={ideaId} />
          </HasPermission.No>
        </HasPermission>
      }

      {ideaComments && <Comments ideaId={ideaId} />}
      </>
    );
};

const Data = adopt<DataProps, InputProps>({
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  project: ({ idea, render }) => !isNilOrError(idea) ? <GetProject id={idea.relationships.project.data.id}>{render}</GetProject> : null,
  ideaComments: ({ ideaId, render }) => <GetComments ideaId={ideaId}>{render}</GetComments>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <CommentsSection {...inputProps} {...dataProps} />}
  </Data>
);
