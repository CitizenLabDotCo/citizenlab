import React, { PureComponent, memo } from 'react';
import { adopt } from 'react-adopt';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';

// services
import { isAdmin } from 'services/permissions/roles';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetComments, { GetCommentsChildProps } from 'resources/GetComments';

// components
import Warning from 'components/UI/Warning';
import Link from 'utils/cl-router/Link';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

const Container = styled.div`
  margin-bottom: 40px;
`;

const NoCommentsWarning = styled(Warning)`
  margin-bottom: 20px;
`;

const StyledLink = styled(Link) `
  color: #1391A1;
  text-decoration: underline;
  transition: all 100ms ease-out;

  &:hover {
    text-decoration: underline;
  }
`;

interface InputProps {
  initiativeId: string;
}

interface DataProps {
  authUser: GetAuthUserChildProps;
  comments: GetCommentsChildProps;
}

interface Props extends InputProps, DataProps {}

class IdeaCommentingWarnings extends PureComponent<Props> {

    render() {
      const { authUser, comments: { commentsList } } = this.props;
      const isLoggedIn = !isNilOrError(authUser);
      const userIsAdmin = !isNilOrError(authUser) && isAdmin({ data: authUser });

      return (
        <Container>
          {/*
            Show warning message when there are no comments and you're logged in as an admin.
            Otherwise the comment section would be empty (because admins don't see the parent comment box),
            which might look weird or confusing
          */}
          {userIsAdmin && !isNilOrError(commentsList) && commentsList.length === 0 &&
            <NoCommentsWarning>
              <FormattedMessage {...messages.noComments} />
            </NoCommentsWarning>
          }

          {!isLoggedIn &&
            <Warning>
              <FormattedMessage
                {...messages.signInToComment}
                values={{
                  signInLink: <StyledLink to="/sign-in"><FormattedMessage {...messages.signInLinkText} /></StyledLink>,
                }}
              />
            </Warning>
          }

        </Container>
      );
    }
}

const Data = adopt<DataProps, InputProps>({
  authUser: <GetAuthUser />,
  comments: ({ initiativeId, render }) => <GetComments postId={initiativeId} postType="initiative">{render}</GetComments>,
});

export default memo<InputProps>((inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaCommentingWarnings {...inputProps} {...dataProps} />}
  </Data>
));
