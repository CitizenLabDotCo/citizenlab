import React, { PureComponent, MouseEvent } from 'react';
import { isString, trim, get } from 'lodash-es';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';
import MentionsTextArea from 'components/UI/MentionsTextArea';
import CommentingDisabled from './CommentingDisabled';
import Author from 'components/Author';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../messages';

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
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-top: 20px;
  padding-bottom: 20px;
  padding-left: 50px;
  padding-right: 50px;
  background: #F1F2F4;
  border: 1px solid #E3E3E3;
  box-sizing: border-box;
  box-shadow: inset 0px 1px 2px rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  transition: all 100ms ease;

  &.focussed {
    border-color: ${darken(0.2, '#E3E3E3')};
  }

  ${media.smallerThanMinTablet`
    padding: 15px;
  `}
`;

const AuthorWrapper = styled.div`
  margin-bottom: 6px;
`;

const StyledAuthor = styled(Author)`
  margin-left: -4px;
`;

const Form = styled.form`
  flex: 1;
`;

const HiddenLabel = styled.span`
  ${hideVisually()}
`;

const FormInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
`;

interface InputProps {
  ideaId: string;
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
  focussed: boolean;
  processing: boolean;
  errorMessage: string | null;
}

class ParentCommentForm extends PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      inputValue: '',
      focussed: false,
      processing: false,
      errorMessage: null
    };
  }

  onChange = (inputValue: string) => {
    this.setState({
      inputValue,
      focussed: true,
      errorMessage: null
    });
  }

  onFocus = () => {
    trackEventByName(tracks.focusParentCommentEditor, {
      extra: {
        ideaId: this.props.ideaId
      }
    });

    this.setState({ focussed: true });
  }

  onBlur = () => {
    this.setState({ focussed: false });
  }

  onSubmit = async (event: MouseEvent<any>) => {
    event.preventDefault();

    const { locale, authUser, ideaId, idea } = this.props;
    const { formatMessage } = this.props.intl;
    const { inputValue } = this.state;
    const projectId = (!isNilOrError(idea) ? get(idea.relationships.project.data, 'id', null) : null);

    this.setState({
      focussed: false,
      processing: false,
      errorMessage: null
    });

    if (locale && authUser && projectId && isString(inputValue) && trim(inputValue) !== '') {
      trackEventByName(tracks.clickParentCommentPublish, {
        extra: {
          ideaId,
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
    const { inputValue, focussed, processing, errorMessage } = this.state;
    const commentingEnabled = (!isNilOrError(idea) ? get(idea.relationships.action_descriptor.data.commenting, 'enabled', false) : false);
    const commentingDisabledReason = (!isNilOrError(idea) ? get(idea.relationships.action_descriptor.data.commenting, 'disabled_reason', null) : null);
    const projectId = (!isNilOrError(idea) ? get(idea.relationships.project.data, 'id', null) : null);
    const commentButtonDisabled = (!inputValue || inputValue === '');
    const canComment = (authUser && commentingEnabled);
    const authorCanModerate = !isNilOrError(authUser) && canModerate(projectId, { data: authUser });

    return (
      <Container className={className}>
        <CommentingDisabled
          isLoggedIn={!!authUser}
          commentingEnabled={commentingEnabled}
          commentingDisabledReason={commentingDisabledReason}
          projectId={projectId}
        />

        {(authUser && canComment) &&
          <CommentContainer className={`e2e-comment-form ideaCommentForm ${focussed ? 'focussed' : ''}`}>
            <AuthorWrapper>
              <StyledAuthor
                authorId={authUser.id}
                notALink={authUser.id ? false : true}
                size="32px"
                showModeration={authorCanModerate}
                avatarBadgeBgColor="#f1f2f4"
              />
            </AuthorWrapper>

            <Form onSubmit={this.onSubmit}>
              <label htmlFor="submit-comment">
                <HiddenLabel>
                  <FormattedMessage {...messages.yourComment} />
                </HiddenLabel>

                <FormInner>
                  <MentionsTextArea
                    id="submit-comment"
                    name="comment"
                    placeholder={this.placeholder}
                    rows={5}
                    ideaId={ideaId}
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
                      className="e2e-submit-comment"
                      processing={processing}
                      icon="send"
                      onClick={this.onSubmit}
                      disabled={commentButtonDisabled}
                    >
                      <FormattedMessage {...messages.publishComment} />
                    </Button>
                  </ButtonWrapper>
                </FormInner>
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

const ParentCommentFormWithHoCs = injectIntl<Props>(ParentCommentForm);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <ParentCommentFormWithHoCs {...inputProps} {...dataProps} />}
  </Data>
);
