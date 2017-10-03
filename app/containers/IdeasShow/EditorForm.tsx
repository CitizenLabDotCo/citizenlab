import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Link } from 'react-router';
import styled from 'styled-components';
import classNames from 'classnames';

// components
import Button from 'components/UI/Button';
import Editor from 'components/UI/Editor';
import Authorize, { Else } from 'utils/containers/authorize';
import Avatar from 'components/Avatar';

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// i18n
import { FormattedMessage, injectIntl, InjectedIntl, InjectedIntlProps } from 'react-intl';
import messages from './messages';

// services
import { authUserStream } from 'services/auth';
import { localeStream } from 'services/locale';
import { IUser } from 'services/users';
import { addCommentToIdea, addCommentToComment } from 'services/comments';

// Styling
const CommentForm = styled.form`
  .rdw-editor-toolbar {
    display: none;
  }

  .draft-editor {
    background: #f8f8f8;

    &.focus {
      box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.15);
    }
  }
`;

const UserArea = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: 10px;
`;

const UserAvatar = styled(Avatar)`
  width: 30px;
  height: 30px;
  margin-right: 8px;
`;

const UserName = styled.div`
  color: #1391A1;
  font-size: 16px;
  line-height: 20px;
  font-weight: 400;
`;

const SubmitButton = styled(Button)``;

const SuccessMessage = styled.p`
  color: #32B67A;
`;

const SubmitArea = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin: -5rem 1px 0 1px;
  padding: 1rem;
  position: relative;
  z-index: 1;

  &.success,
  &.error {
    background: linear-gradient(0deg,rgba(255,255,255,.95) 85%, rgba(255,255,255, 0));
  }

  .message {
    font-weight: 500;
  }
`;

type Props = {
  parentId?: string;
  ideaId: string;
};

type Tracks = {
  focusEditor: Function;
  clickCommentPublish: Function;
};

type State = {
  editorState: EditorState;
  locale: string | null;
  authUser: IUser | null;
  processing: boolean;
  errorMessage: string | null;
  success: boolean;
};

class EditorForm extends React.PureComponent<Props & InjectedIntlProps & Tracks, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      editorState: EditorState.createEmpty(),
      locale: null,
      authUser: null,
      processing: false,
      errorMessage: null,
      success: false
    };
  }

  componentWillMount () {
    const locale$ = localeStream().observable;
    const authUser$ = authUserStream().observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        authUser$
      ).subscribe(([locale, authUser]) => {
        this.setState({
          locale,
          authUser
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleEditorOnChange = (editorState) => {
    this.setState({ editorState });
  }

  handleEditorOnFocus = () => {
    this.props.focusEditor({
      extra: {
        ideaId: this.props.ideaId,
        parentId: this.props.parentId
      },
    });
  }

  handleSubmit = async (event) => {
    const { ideaId, parentId } = this.props;
    const { formatMessage } = this.props.intl;
    const { locale, authUser } = this.state;
    const htmlContent: string = draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()));
    const isHtmlContentValid = (_.isString(htmlContent) && !_.isEmpty(htmlContent) && _.trim(htmlContent) !== '<p></p>');

    event.preventDefault();

    this.setState({ errorMessage: null, processing: false, success: false });

    if (isHtmlContentValid && locale && authUser) {
      this.props.clickCommentPublish({
        extra: {
          ideaId,
          parentId,
          content: htmlContent,
        },
      });

      if (_.isString(htmlContent) && !_.isEmpty(htmlContent) && _.trim(htmlContent) !== '<p></p>') {
        try {
          this.setState({ processing: true });

          if (!parentId) {
            await addCommentToIdea(ideaId, authUser.data.id, { [locale]: htmlContent });
          } else {
            await addCommentToComment(ideaId, authUser.data.id, parentId, { [locale]: htmlContent });
          }

          this.setState({ editorState: EditorState.createEmpty(), processing: false, success: true });
          setTimeout(() => this.setState({ success: false }), 6000);
        } catch (error) {
          this.setState({ errorMessage: formatMessage(messages.addCommentError), processing: false });
          throw error;
        }
      } else {
        this.setState({ errorMessage: formatMessage(messages.emptyCommentError), processing: false });
      }
    }
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { authUser, processing, errorMessage, success } = this.state;
    const submitAreaClassNames = classNames({
      error: _.isString(errorMessage),
      success: (success === true)
    });

    return (
      <Authorize action={['comments', 'create']}>
        <CommentForm onSubmit={this.handleSubmit}>
          {authUser &&
            <UserArea>
              <UserAvatar userId={authUser.data.id} size="medium" />
              <UserName>
                {authUser.data.attributes.first_name} {authUser.data.attributes.last_name}
              </UserName>
            </UserArea>
          }

          <Editor
            id="editor"
            value={this.state.editorState}
            placeholder={formatMessage(messages.commentBodyPlaceholder)}
            onChange={this.handleEditorOnChange}
            onFocus={this.handleEditorOnFocus}
          />

          <SubmitArea className={submitAreaClassNames}>
            <div className="message">
              {errorMessage && <div>{errorMessage}</div>}

              {success &&
                <SuccessMessage>
                  <FormattedMessage {...messages.commentSuccess} />
                </SuccessMessage>
              }
            </div>

            <SubmitButton loading={processing}>
              <FormattedMessage {...messages.publishComment} />
            </SubmitButton>
          </SubmitArea>

        </CommentForm>
        <Else>
          <FormattedMessage
            {...messages.signInToComment}
            values={{
              signInLink: <Link to="/sign-in"><FormattedMessage {...messages.signInLinkText} /></Link>,
            }}
          />
        </Else>
      </Authorize>
    );
  }
}

export default injectTracks<Props>({
  focusEditor: tracks.focusNewCommentTextbox,
  clickCommentPublish: tracks.clickCommentPublish,
})(injectIntl<Props>(EditorForm));
