// Libraries
import * as React from 'react';
import * as _ from 'lodash';
import { convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Link } from 'react-router';
import styled from 'styled-components';

// Tracking
import { injectTracks } from 'utils/analytics';
import tracks from '../../tracks';

// i18n
import { FormattedMessage, injectIntl, InjectedIntl } from 'react-intl';
import messages from '../../messages';

// Components
import Button from 'components/UI/Button';
import Editor from 'components/UI/Editor';
import Authorize, { Else } from 'utils/containers/authorize';

// Store
import { connect } from 'react-redux';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import { publishCommentRequest } from '../../actions';
import selectIdeasShow from '../../selectors';

// Styling
const CommentEditor = styled(Editor)`
  background: #f8f8f8 !important;

  .rdw-editor-toolbar {
    display: none;
  }
`;

const SubmitButton = styled(Button)`
`;

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

interface Props {
  parentId?: string;
  ideaId: string;
  intl: InjectedIntl;
  publishCommentRequest: Function;
  locale: string;
  formStatus: 'processing' | 'error' | 'success' | undefined;
  error: string;
  typeComment: Function;
  clickCommentPublish: Function;
}

interface State {
  editorState: any;
}

class EditorForm extends React.PureComponent<Props, State> {
  values: {
    ideaId: string;
    parentId?: string;
  };

  constructor(props) {
    super(props);
    this.values = { ideaId: props.ideaId, parentId: props.parentId };
    this.state = {
      editorState: null,
    };
  }

  componentWillReceiveProps (newProps: Props) {
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

    return (
      <Authorize action={['comments', 'create']}>
        <form onSubmit={this.handleSubmit}>
          <CommentEditor
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

        </form>
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

export default injectTracks({
  typeComment: tracks.typeComment,
  clickCommentPublish: tracks.clickCommentPublish,
})(injectIntl(connect(mapStateToProps, mapDispatchToProps)(EditorForm)));
