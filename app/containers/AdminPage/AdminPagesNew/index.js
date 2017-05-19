import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { bindActionCreators } from 'redux';
import WatchSagas from 'containers/WatchSagas';
import styled from 'styled-components';
import { preprocess } from 'utils';
import { createStructuredSelector } from 'reselect';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState, convertToRaw } from 'draft-js';
import { Grid, Button, Input, Segment } from 'semantic-ui-react';
import draftToHtml from 'draftjs-to-html';
import FormattedMessageSegment from 'components/FormattedMessageSegment';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';

import Sidebar from './../SideBar/';
import sagas from './sagas';
import { setFormError, publishPageRequest, setTitle } from './actions';
import messages from './messages';
import { selectAdminNewPages } from './selectors';

const Wrapper = styled.div`
  padding-top: 100px;
`;

class AdminPagesNew extends React.Component { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    this.state = {
      editorState: EditorState.createEmpty(),
    };

    // provide 'this' context to bindings
    this.publishPage = this.publishPage.bind(this);
    this.setTitle = this.setTitle.bind(this);
  }

  onEditorStateChange = (editorState) => {
    this.setState({ editorState });
  };

  setTitle(e, data) {
    this.props.setTitle(data.value);
  }

  publishPage() {
    const { locale, title } = this.props;
    const rawContent = convertToRaw(this.state.editorState.getCurrentContent());
    const htmlContent = draftToHtml(rawContent);

    if (title === '' || !htmlContent || htmlContent.trim() === '<p></p>') {
      this.props.setFormError();
      return;
    }

    const htmlContents = {};
    htmlContents[locale] = htmlContent;

    const titles = {};
    titles[locale] = title;

    this.props.publishPageRequest(htmlContents, titles);
  }

  render() {
    const { editorState } = this.state;
    const { formatMessage } = this.props.intl;
    const { publishing, publishError, invalidFormError, published, location } = this.props;

    return (
      <Wrapper>
        <WatchSagas sagas={sagas} />
        {publishing && <FormattedMessageSegment message={messages.publishing} />}
        {publishError && <FormattedMessageSegment
          message={messages.publishError}
          values={{ publishError }}
        />}
        {invalidFormError && <FormattedMessageSegment message={messages.invalidFormError} />}
        {published && <FormattedMessageSegment message={messages.published} />}
        <Grid>
          <Grid.Row columns={2}>
            <Grid.Column width={3}>
              <Sidebar location={location} />
            </Grid.Column>
            <Grid.Column width={12}>
              <h1>
                <FormattedMessage {...messages.header} />
              </h1>
              <Grid>
                <Grid.Row columns={2}>
                  <Grid.Column width={12}>
                    <Input
                      fluid
                      placeholder={formatMessage({ ...messages.titlePlaceholder })}
                      onChange={this.setTitle}
                    />
                  </Grid.Column>
                  <Grid.Column width={4} textAlign="right">
                    <Button onClick={this.publishPage}>
                      <FormattedMessage {...messages.publish} />
                    </Button>
                  </Grid.Column>
                </Grid.Row>
              </Grid>
              <Segment>
                <Editor
                  toolbar={{
                    options: ['inline'],
                    inline: {
                      options: ['bold', 'italic', 'underline'],
                    },
                  }}
                  editorState={editorState}
                  onEditorStateChange={this.onEditorStateChange}
                />
              </Segment>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Wrapper>
    );
  }
}

AdminPagesNew.propTypes = {
  publishing: PropTypes.bool.isRequired,
  invalidFormError: PropTypes.bool.isRequired,
  publishError: PropTypes.string,
  published: PropTypes.bool.isRequired,
  publishPageRequest: PropTypes.func.isRequired,
  setTitle: PropTypes.func.isRequired,
  setFormError: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  locale: PropTypes.string,
  title: PropTypes.string.isRequired,
};

const mapStateToProps = createStructuredSelector({
  pageState: selectAdminNewPages,
  locale: makeSelectLocale(),
});

export const mapDispatchToProps = (dispatch) => bindActionCreators({
  publishPageRequest,
  setFormError,
  setTitle,
}, dispatch);

const mergeProps = ({ pageState, locale }, dispatchProps, { intl, location }) => ({
  publishing: pageState.get('publishing'),
  publishError: pageState.get('publishError'),
  invalidFormError: pageState.get('invalidFormError'),
  published: pageState.get('published'),
  title: pageState.get('title'),
  intl,
  locale,
  location,
  ...dispatchProps,
});

export default injectIntl(preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(AdminPagesNew));
