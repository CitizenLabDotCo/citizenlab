import React, { PureComponent, MouseEvent } from 'react';
import { isString, trim, get } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import MentionsTextArea from 'components/UI/MentionsTextArea';
import Author from 'components/Author';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';

// services
import { addCommentToIdea } from 'services/comments';
import { canModerate } from 'services/permissions/rules/projectPermissions';

// resources
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

// style
import styled from 'styled-components';
import { hideVisually, darken } from 'polished';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  margin-bottom: 20px;
`;

const CommentContainer = styled.div`
  padding-top: 20px;
  padding-bottom: 20px;
  padding-left: 50px;
  padding-right: 50px;
  background: #fff;
  border: 1px solid #e3e3e3;
  box-sizing: border-box;
  box-shadow: inset 0px 1px 3px 0px rgba(0, 0, 0, 0.08);
  border-radius: ${(props: any) => props.theme.borderRadius};
  transition: all 100ms ease;

  &.focused {
    border-color: ${darken(0.2, '#e3e3e3')};
  }

  ${media.smallerThanMinTablet`
    padding: 15px;
  `}
`;

const AuthorWrapper = styled.div`
  width: 100%;
  margin-bottom: 6px;
`;

const StyledAuthor = styled(Author)`
  margin-left: -4px;
`;

const Form = styled.form`
  width: 100%;
`;

const HiddenLabel = styled.span`
  ${hideVisually()}
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
`;

interface InputProps {
  ideaId: string;
  postingComment: (arg: boolean) => void;
  className?: string;
}

interface DataProps {
  locale: GetLocaleChildProps;
  authUser: GetAuthUserChildProps;
  idea: GetIdeaChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  inputValue: string;
  focused: boolean;
  processing: boolean;
  errorMessage: string | null;
}

class IdeaParentCommentForm extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: '',
      focused: false,
      processing: false,
      errorMessage: null
    };
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    if (prevState.processing !== this.state.processing) {
      this.props.postingComment(this.state.processing);
    }
  }

  onChange = (inputValue: string) => {
    this.setState({
      inputValue,
      focused: true,
      errorMessage: null
    });
  }

  onFocus = () => {
    trackEventByName(tracks.focusParentCommentEditor, {
      extra: {
        postType: 'idea',
        ideaId: this.props.ideaId
      }
    });

    this.setState({ focused: true });
  }

  onBlur = () => {
    this.setState({ focused: false });
  }

  onSubmit = async (event: MouseEvent<any>) => {
    event.preventDefault();

    const { locale, authUser, ideaId, idea } = this.props;
    const { formatMessage } = this.props.intl;
    const { inputValue } = this.state;
    const projectId = (!isNilOrError(idea) ? get(idea.relationships.project.data, 'id', null) : null);

    this.setState({
      focused: false,
      processing: true,
      errorMessage: null
    });

    if (locale && authUser && projectId && isString(inputValue) && trim(inputValue) !== '') {
      trackEventByName(tracks.clickParentCommentPublish, {
        extra: {
          ideaId,
          postType: 'idea',
          content: inputValue
        }
      });

      try {
        this.setState({ processing: true });
        await addCommentToIdea(ideaId, projectId, authUser.id, { [locale]: inputValue.replace(/\@\[(.*?)\]\((.*?)\)/gi, '@$2') });
        this.setState({ inputValue: '', processing: false });
      } catch (error) {
        const errorMessage = formatMessage(messages.addCommentError);
        this.setState({ errorMessage, processing: false });
        throw error;
      }
    } else if (locale && authUser && (!inputValue || inputValue === '')) {
      const errorMessage = formatMessage(messages.emptyCommentError);
      this.setState({ errorMessage, processing: false });
    }
  }

  placeholder = this.props.intl.formatMessage(messages.commentBodyPlaceholder);

  render() {
    const { authUser, idea, ideaId, className } = this.props;
    const { inputValue, focused, processing, errorMessage } = this.state;
    const commentingEnabled = (!isNilOrError(idea) ? get(idea.attributes.action_descriptor.commenting, 'enabled', false) : false);
    const projectId = (!isNilOrError(idea) ? get(idea.relationships.project.data, 'id', null) : null);
    const commentButtonDisabled = (!inputValue || inputValue === '');
    const isModerator = !isNilOrError(authUser) && canModerate(projectId, { data: authUser });
    const canComment = (authUser && commentingEnabled && !isModerator);

    return (
      <Container className={className}>
        {(authUser && canComment) &&
          <CommentContainer className={focused ? 'focused' : ''}>
            <AuthorWrapper>
              <StyledAuthor
                authorId={authUser.id}
                notALink={authUser.id ? false : true}
                size="32px"
                avatarBadgeBgColor="#f1f2f4"
              />
            </AuthorWrapper>

            <Form onSubmit={this.onSubmit}>
              <label htmlFor="submit-comment">
                <HiddenLabel>
                  <FormattedMessage {...messages.yourComment} />
                </HiddenLabel>

                <MentionsTextArea
                  id="submit-comment"
                  className="e2e-parent-comment-form"
                  name="comment"
                  placeholder={this.placeholder}
                  rows={5}
                  postType="idea"
                  postId={ideaId}
                  value={inputValue}
                  error={errorMessage}
                  onChange={this.onChange}
                  onFocus={this.onFocus}
                  onBlur={this.onBlur}
                  fontWeight="300"
                  padding="10px 0px"
                  borderRadius="none"
                  border="none"
                  boxShadow="none"
                />
                <ButtonWrapper>
                  <Button
                    className="e2e-submit-parentcomment"
                    processing={processing}
                    icon="send"
                    onClick={this.onSubmit}
                    disabled={commentButtonDisabled}
                  >
                    <FormattedMessage {...messages.publishComment} />
                  </Button>
                </ButtonWrapper>
              </label>
            </Form>
          </CommentContainer>
        }
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  authUser: <GetAuthUser />,
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>
});

const IdeaParentCommentFormWithHoCs = injectIntl<Props>(IdeaParentCommentForm);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaParentCommentFormWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
