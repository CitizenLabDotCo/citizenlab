import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import { convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Link } from 'react-router';
import styled from 'styled-components';

// components
import Button from 'components/UI/Button';
import Editor from 'components/UI/Editor';
import Authorize, { Else } from 'utils/containers/authorize';
import Avatar from 'components/Avatar';

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from '../../tracks';

// i18n
import { FormattedMessage, injectIntl, InjectedIntl, InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// Store
import { connect } from 'react-redux';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import { publishCommentRequest } from '../../actions';
import selectIdeasShow from '../../selectors';
import { authUserStream } from 'services/auth';
import { IUser } from 'services/users';

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
  typeComment: Function;
  clickCommentPublish: Function;
};

type MappedProps = {
  locale: string;
  formStatus: 'processing' | 'error' | 'success' | undefined;
  error: string;
  publishCommentRequest: Function;
};

type State = {
  editorState: any;
  authUser: IUser | null;
};

type CombinedProps = Props & MappedProps & InjectedIntlProps & Tracks;

class EditorForm extends React.PureComponent<CombinedProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  values: {
    ideaId: string;
    parentId?: string;
  };

  constructor(props) {
    super(props);
    this.values = { ideaId: props.ideaId, parentId: props.parentId };
    this.state = {
      editorState: null,
      authUser: null,
    };
  }

  componentWillMount () {
    const authUser$ = authUserStream().observable;

    this.subscriptions = [
      authUser$.subscribe(authUser => this.setState({ authUser }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  componentWillReceiveProps (newProps: CombinedProps) {
    // Clean form state upon success
    if (newProps.formStatus === 'success' && this.props.formStatus !== 'success') {
      this.setState({ editorState: null });
    }
  }

  trackEditorChange = _.debounce(() => {
    this.props.typeComment({
      extra: {
        ideaId: this.props.ideaId,
        parentId: this.props.parentId,
        content: draftToHtml(convertToRaw(this.state.editorState.getCurrentContent())),
      },
    });
  }, 2500);

  handleEditorChange = (editorState) => {
    this.setState({ editorState }, this.trackEditorChange);
  }

  handleSubmit = (event) => {
    event.preventDefault();

    if (!this.state.editorState) {
      return;
    }

    const editorContent = convertToRaw(this.state.editorState.getCurrentContent());
    const htmlContent = draftToHtml(editorContent);

    this.props.clickCommentPublish({
      extra: {
        ideaId: this.props.ideaId,
        parentId: this.props.parentId,
        content: htmlContent,
      },
    });

    if (htmlContent && htmlContent.trim() !== '<p></p>') {
      const bodyMultiloc = {};
      bodyMultiloc[this.props.locale] = htmlContent;

      const comment = {
        parent_id: this.props.parentId,
        body_multiloc: bodyMultiloc,
      };
      this.props.publishCommentRequest(this.props.ideaId, comment);
    }
  }

  /* eslint-disable react/jsx-boolean-value*/
  render() {
    const { formatMessage } = this.props.intl;
    const { formStatus, error } = this.props;
    const { authUser } = this.state;

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
            onChange={this.handleEditorChange}
          />

          <SubmitArea className={formStatus || ''}>
            <div className="message">
              {formStatus === 'error' && <div>{error}</div>}

              {formStatus === 'success' &&
                <SuccessMessage>
                  <FormattedMessage {...messages.commentSuccess} />
                </SuccessMessage>
              }
            </div>

            <SubmitButton loading={formStatus === 'processing'}>
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

const mapDispatchToProps = {
  publishCommentRequest,
};

const mapStateToProps = (state, { parentId }) => ({
  locale: makeSelectLocale()(state),
  formStatus: selectIdeasShow('newComment', parentId || 'root', 'formStatus')(state),
  error: selectIdeasShow('newComment', parentId || 'root', 'error')(state),
});

export default injectTracks<Props>({
  typeComment: tracks.typeComment,
  clickCommentPublish: tracks.clickCommentPublish,
})(injectIntl<Props>(connect(mapStateToProps, mapDispatchToProps)(EditorForm)));
