/*
 *
 * IdeasNewPage
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
import { FormattedMessage } from 'react-intl';
import {
  makeSelectStored,
  makeSelectContent,
  makeSelectLoadError,
  makeSelectLoading,
  makeSelectStoreError, makeSelectSubmitError, makeSelectSubmitted, makeSelectSubmitting,
  makeSelectShortTitleError, makeSelectLongTitleError, makeSelectTitleLength, makeSelectAttachments,
  makeSelectLoadAttachmentsError, makeSelectStoreAttachmentError, makeSelectImages, makeSelectLoadImagesError,
  makeSelectStoreImageError,
} from './selectors';
import {
  storeDraft, loadDraft, saveDraft, storeIdea, setTitle, loadAttachments,
  storeAttachmentError, storeAttachment, storeImage, storeImageError, loadImages,
} from './actions';
import IdeaEditorWrapper from './IdeaEditorWrapper';
import messages from './messages';
import AttachmentList from './AttachmentList';
import ImageList from './ImageList';

export class IdeasNewPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    // bind event handlers
    this.saveDraft = this.saveDraft.bind(this);
    this.storeIdea = this.storeIdea.bind(this);
  }

  saveDraft() {
    this.props.saveDraftClick(this.props.content);
  }

  storeIdea() {
    const { content, shortTitleError, longTitleError } = this.props;

    this.props.publishIdeaClick(content, shortTitleError || longTitleError);
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
          title="IdeasNewPage"
          meta={[
            { name: 'description', content: 'Description of IdeasNewPage' },
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
              <ImageList
                loadImages={this.props.loadImages}
                storeImage={this.props.storeImage}
                images={this.props.images}
                storeImageError={this.props.storeImageError}
                loadImagesError={this.props.loadImagesError}
              />
            </Row>
          </Column>
          <Column large={4}>
            <Row>
              {/* TODO: style buttons */}
              <Column large={5} offsetOnLarge={1}>
                <Button onClick={this.saveDraft}>
                  <FormattedMessage {...messages.saveAsDraft} />
                </Button>
              </Column>
              <Column large={5} offsetOnLarge={1}>
                <Button onClick={this.storeIdea}>
                  <FormattedMessage {...messages.publish} />
                </Button>
              </Column>
            </Row>
            <Row isExpanded>
              <StyledLabel>Location</StyledLabel>
              {/* TODO: location image here*/}
              <StyledHr />
              <StyledLabel>Attachments</StyledLabel>
              <AttachmentList
                loadAttachments={this.props.loadAttachments}
                storeAttachment={this.props.storeAttachment}
                attachments={this.props.attachments}
                storeAttachmentError={this.props.storeAttachmentError}
                loadAttachmentsError={this.props.loadAttachmentsError}
              />
            </Row>
          </Column>
        </Row>
      </div>
    );
  }
}

IdeasNewPage.propTypes = {
  className: PropTypes.string,
  saveDraftClick: PropTypes.func.isRequired,
  publishIdeaClick: PropTypes.func.isRequired,
  shortTitleError: PropTypes.bool.isRequired,
  longTitleError: PropTypes.bool.isRequired,
  content: PropTypes.string,
  loadAttachments: PropTypes.func.isRequired,
  storeAttachment: PropTypes.func.isRequired,
  attachments: PropTypes.any.isRequired,
  loadAttachmentsError: PropTypes.bool.isRequired,
  storeAttachmentError: PropTypes.bool.isRequired,
  loadImages: PropTypes.func.isRequired,
  storeImage: PropTypes.func.isRequired,
  images: PropTypes.any.isRequired,
  loadImagesError: PropTypes.bool.isRequired,
  storeImageError: PropTypes.bool.isRequired,
};

const mapStateToProps = createStructuredSelector({
  loading: makeSelectLoading(),
  loadError: makeSelectLoadError(),
  storeError: makeSelectStoreError(),
  content: makeSelectContent(),
  submitError: makeSelectSubmitError(),
  submitted: makeSelectSubmitted(),
  submitting: makeSelectSubmitting(),
  stored: makeSelectStored(),
  shortTitleError: makeSelectShortTitleError(),
  longTitleError: makeSelectLongTitleError(),
  titleLength: makeSelectTitleLength(),
  attachments: makeSelectAttachments(),
  loadAttachmentsError: makeSelectLoadAttachmentsError(),
  storeAttachmentError: makeSelectStoreAttachmentError(),
  images: makeSelectImages(),
  loadImagesError: makeSelectLoadImagesError(),
  storeImageError: makeSelectStoreImageError(),
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
    publishIdeaClick(content, titleError) {
      if (content.trim() !== '<p></p>' && !titleError) {
        // content is already in HTML format
        dispatch(storeIdea(content));
      }
    },
    setTitle(e) {
      dispatch(setTitle(e.target.value));
    },
    loadAttachments() {
      dispatch(loadAttachments());
    },
    storeAttachment(file) {
      if (file) {
        dispatch(storeAttachment(file));
      } else {
        dispatch(storeAttachmentError());
      }
    },
    loadImages() {
      dispatch(loadImages());
    },
    storeImage(file) {
      if (file) {
        dispatch(storeImage(file));
      } else {
        dispatch(storeImageError());
      }
    },
  };
}

export default styled(connect(mapStateToProps, mapDispatchToProps)(IdeasNewPage))`
  backgroundColor: '#eeeeee';
  minHeight: '850px';
  width: '100%';
  margin-top: 30px;
`;
