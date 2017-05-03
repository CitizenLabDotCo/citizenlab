/*
 *
 * IdeasNewPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { createStructuredSelector } from 'reselect';
import { Container, Label, Divider } from 'semantic-ui-react';
import styled from 'styled-components';
import Breadcrumbs from 'components/Breadcrumbs';
import draftToHtml from 'draftjs-to-html';
import { Saga } from 'react-redux-saga';

import {
  makeSelectStored, makeSelectContent, makeSelectLoadError, makeSelectLoading, makeSelectStoreError,
  makeSelectSubmitError, makeSelectSubmitted, makeSelectSubmitting, makeSelectShortTitleError, makeSelectLongTitleError,
  makeSelectTitleLength, makeSelectAttachments, makeSelectStoreAttachmentError, makeSelectImages,
  makeSelectStoreImageError, makeSelectTitle,
} from './selectors';
import {
  saveDraft, setTitle, storeAttachment, storeImage, storeImageError, storeAttachmentError,
  publishIdeaRequest,
} from './actions';
import IdeaEditorWrapper from './IdeaEditorWrapper';
import AttachmentList from './AttachmentList';
import ImageList from './ImageList';
import canPublish from './canPublish';
import { makeSelectLocale } from '../LanguageProvider/selectors';
import { makeSelectCurrentUser } from '../../utils/auth/selectors';
import { watchStoreIdea } from './sagas';

export class IdeasNewPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    // provide 'this' context to callbacks
    this.saveDraft = this.saveDraft.bind(this);
    this.storeIdea = this.storeIdea.bind(this);
  }

  sendIdea(isDraft) {
    const { content, shortTitleError, longTitleError, title, images, attachments, user, locale } = this.props;

    this.props.publishIdeaClick(content, shortTitleError || longTitleError, title, images, attachments, user && user.id, locale, isDraft);
  }

  saveDraft() {
    this.sendIdea(true);
  }

  storeIdea() {
    this.sendIdea(false);
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

    // eslint-disable-next-line no-shadow
    const { className, attachments, storeAttachment, storeAttachmentError, images, storeImage, storeImageError } = this.props;

    return (
      <Container className={className}>
        <Helmet
          title="IdeasNewPage"
          meta={[
            { name: 'description', content: 'Description of IdeasNewPage' },
          ]}
        />
        <Saga saga={watchStoreIdea} />
        <Breadcrumbs />
        <IdeaEditorWrapper
          saveDraft={this.saveDraft}
          storeIdea={this.storeIdea}
          {...this.props}
        />
        <StyledLabel>Add image(s)</StyledLabel>
        <ImageList
          storeImage={storeImage}
          images={images}
          storeImageError={storeImageError}
        />
        <StyledLabel>Location</StyledLabel>
        {/* TODO: location image here*/}
        <Divider />
        <StyledLabel>Attachments</StyledLabel>
        <AttachmentList
          storeAttachment={storeAttachment}
          attachments={attachments}
          storeAttachmentError={storeAttachmentError}
        />
      </Container>
    );
  }
}

IdeasNewPage.propTypes = {
  className: PropTypes.string,
  publishIdeaClick: PropTypes.func.isRequired,
  shortTitleError: PropTypes.bool.isRequired,
  longTitleError: PropTypes.bool.isRequired,
  content: PropTypes.string,
  storeAttachment: PropTypes.func.isRequired,
  attachments: PropTypes.any.isRequired,
  storeAttachmentError: PropTypes.bool.isRequired,
  storeImage: PropTypes.func.isRequired,
  images: PropTypes.any.isRequired,
  storeImageError: PropTypes.bool.isRequired,
  user: PropTypes.object,
  title: PropTypes.string.isRequired,
  locale: PropTypes.string.isRequired,
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
  storeAttachmentError: makeSelectStoreAttachmentError(),
  images: makeSelectImages(),
  storeImageError: makeSelectStoreImageError(),
  locale: makeSelectLocale(),
  user: makeSelectCurrentUser(),
  title: makeSelectTitle(),
});

export function mapDispatchToProps(dispatch) {
  return {
    storeDraftCopy(content) {
      // convert to HTML
      const htmlContent = draftToHtml(content);

      dispatch(saveDraft(htmlContent));
    },
    publishIdeaClick(content, titleError, title, images, attachments, userId, locale, isDraft) {
      const contentNotNull = content || '<p></p>';

      if (canPublish(contentNotNull, titleError)) {
        // inject strings for current locale as a mutiloc object
        const htmlContents = {};
        const titles = {};
        htmlContents[locale] = contentNotNull;
        titles[locale] = title;

        dispatch(publishIdeaRequest(htmlContents, titles, images, attachments, userId, isDraft));
      }
    },
    setTitle(e) {
      dispatch(setTitle(e.target.value));
    },
    storeAttachment(file) {
      if (file) {
        dispatch(storeAttachment(file));
      } else {
        dispatch(storeAttachmentError());
      }
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
