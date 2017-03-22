/*
 *
 * SubmitIdeaPage
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { createStructuredSelector } from 'reselect';
import { Row, Column, Button, Label } from 'components/Foundation';
import styled from 'styled-components';
import Breadcrumbs from 'components/Breadcrumbs';
import draftToHtml from 'draftjs-to-html';

import {
  makeSelectStored,
  makeSelectContent,
  makeSelectLoadError,
  makeSelectLoading,
  makeSelectStoreError,
} from './selectors';
import { storeDraft, loadDraft, saveDraft, storeIdea } from './actions';
import IdeaEditorWrapper from './IdeaEditorWrapper';

export class SubmitIdeaPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    this.saveDraft = this.saveDraft.bind(this);
  }

  saveDraft() {
    this.props.saveDraftClick(this.props.content);
  }

  render() {
    const StyledLabel = styled(Label)`
      height: 16px;
      opacity: 0.5;
      font-stretch: normal;
      font-family: OpenSans;
      text-align: left;
      letter-spacing: normal;
      font-style: normal;
      line-height: 1.33;
      color: #303839;
      font-size: 12px;
      font-weight: bold;
      margin: 20px 0 10px;
    `;

    const StyledHr = styled.hr`
      width: 80%;
        margin-left: 10px;
    `;

    return (
      <div className={this.props.className}>
        <Helmet
          title="SubmitIdeaPage"
          meta={[
            { name: 'description', content: 'Description of SubmitIdeaPage' },
          ]}
        />
        <Breadcrumbs />
        <Row>
          <Column large={7} offsetOnLarge={1}>
            <Row>
              <IdeaEditorWrapper
                {...this.props}
              />
            </Row>
            <Row>
              <StyledLabel>Add image(s)</StyledLabel>
              {/* TODO: add images image here*/}
            </Row>
          </Column>
          <Column large={4}>
            <Row>
              {/* TODO: style buttons */}
              <Column large={5} offsetOnLarge={1}>
                <Button onClick={this.saveDraft}>Save as draft</Button>
              </Column>
              <Column large={5} offsetOnLarge={1}>
                <Button>Publish</Button>
              </Column>
            </Row>
            <Row isExpanded>
              <StyledLabel>Location</StyledLabel>
              {/* TODO: location image here*/}
              <StyledHr />
              <StyledLabel>Attachments</StyledLabel>
              {/* TODO: attachments image here*/}
            </Row>
          </Column>
        </Row>
      </div>
    );
  }
}

SubmitIdeaPage.propTypes = {
  className: PropTypes.string,
  saveDraftClick: PropTypes.func.isRequired,
  content: PropTypes.string,
};

const mapStateToProps = createStructuredSelector({
  loading: makeSelectLoading(),
  loadError: makeSelectLoadError(),
  storeError: makeSelectStoreError(),
  content: makeSelectContent(),
  stored: makeSelectStored(),
});

export function mapDispatchToProps(dispatch) {
  return {
    storeDraftCopy(content) {
      // convert to HTML
      const htmlContent = draftToHtml(content);

      dispatch(saveDraft(htmlContent));
    },
    saveDraftClick(content) {
      // content is already in HTML format
      dispatch(storeDraft(content));
    },
    loadExistingDraft() {
      dispatch(loadDraft());
    },
    storeIdea(content) {
      // convert to HTML
      const htmlContent = draftToHtml(content);

      dispatch(storeIdea(htmlContent));
    },
  };
}

export default styled(connect(mapStateToProps, mapDispatchToProps)(SubmitIdeaPage))`
  backgroundColor: '#eeeeee';
  minHeight: '850px';
  width: '100%';
  margin-top: 30px;
`;
