import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';


// components
import Button from 'components/UI/Button';
import Editor from 'components/UI/Editor';

// messages
import messages from '../../messages';
import { publishCommentRequest } from '../../actions';
import selectIdeasShow from '../../selectors';

const SubmitButton = styled(Button)`
  float: right;
  margin-top: 20px;
`;

class EditorForm extends React.PureComponent {
  constructor(props) {
    super(props);
    this.values = { ideaId: props.ideaId, parentId: props.parentId };
    this.state = {
      editorState: null,
    };
  }

  handleEditorChange = (editorState) => {
    this.setState({ editorState });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const editorContent = convertToRaw(this.state.editorState.getCurrentContent());
    const htmlContent = draftToHtml(editorContent);
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
    if (formStatus !== 'success') {
      return (
        <form onSubmit={this.handleSubmit}>
          <Editor
            id="editor"
            value={this.state.editorState}
            placeholder={formatMessage(messages.commentBodyPlaceholder)}
            onChange={this.handleEditorChange}
          />
          {formStatus === 'error' && <div>{error}</div>}
          <SubmitButton
            loading={formStatus === 'processing'}
          >
            <FormattedMessage {...messages.publishComment} />
          </SubmitButton>
          <div style={{ clear: 'both' }}></div>
        </form>
      );
    }
    // if formStatus === 'success'
    return (
      <div>
        <FormattedMessage {...messages.commentSuccess} />
      </div>
    );
  }

}

EditorForm.propTypes = {
  parentId: PropTypes.string,
  ideaId: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  publishCommentRequest: PropTypes.func,
  locale: PropTypes.string,
  formStatus: PropTypes.string, // undefined, 'processing', 'error' or 'success'
  error: PropTypes.string,
};

const mapDispatchToProps = {
  publishCommentRequest,
};

const mapStateToProps = (state, { parentId }) => ({
  locale: makeSelectLocale()(state),
  formStatus: selectIdeasShow('newComment', parentId || 'root', 'formStatus')(state),
  error: selectIdeasShow('newComment', parentId || 'root', 'error')(state),
});

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(EditorForm));
