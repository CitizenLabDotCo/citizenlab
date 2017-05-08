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
import { injectIntl } from 'react-intl';

import {
  makeSelectStored, makeSelectContent, makeSelectLoadError, makeSelectLoading, makeSelectStoreError,
  makeSelectSubmitError, makeSelectSubmitted, makeSelectSubmitting, makeSelectShortTitleError, makeSelectLongTitleError,
  makeSelectTitleLength, makeSelectAttachments, makeSelectStoreAttachmentError, makeSelectImages,
  makeSelectStoreImageError, makeSelectTitle, makeSelectTopics, makeSelectAreas, makeSelectLoadingTopics,
  makeSelectLoadingAreas, makeSelectLoadTopicsError,
} from './selectors';
import {
  saveDraft, setTitle, storeAttachment, storeImage, storeImageError, storeAttachmentError,
  publishIdeaRequest, loadTopicsRequest, loadAreasRequest,
} from './actions';
import IdeaEditorWrapper from './IdeaEditorWrapper';
import AttachmentList from './AttachmentList';
import ImageList from './ImageList';
import canPublish from './canPublish';
import { makeSelectLocale } from '../LanguageProvider/selectors';
import { makeSelectCurrentUser } from '../../utils/auth/selectors';
import { watchGetAreas, watchGetTopics, watchStoreIdea } from './sagas';
import messages from './messages';

export class IdeasNewPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    // provide 'this' context to callbacks
    this.saveDraft = this.saveDraft.bind(this);
    this.storeIdea = this.storeIdea.bind(this);
    this.storeTopics = this.storeTopics.bind(this);
    this.storeAreas = this.storeAreas.bind(this);
  }

  componentDidMount() {
    const { loadTopics, loadAreas } = this.props;

    // load topics and areas
    loadTopics();
    loadAreas();
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

  storeTopics(topics) {
    this.props.handleTopicsSelect(topics);
  }

  storeAreas(areas) {
    this.props.handleAreasSelect(areas);
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
    const { topics, areas, loadingTopics, loadingAreas, loadTopicsError, loadAreasError } = this.props;
    const { formatMessage } = this.props.intl;

    return (
      <Container className={className}>
        <Helmet
          title="IdeasNewPage"
          meta={[
            { name: 'description', content: 'Description of IdeasNewPage' },
          ]}
        />
        <Saga saga={watchStoreIdea} />
        <Saga saga={watchGetTopics} />
        <Saga saga={watchGetAreas} />

        <Breadcrumbs />
        <IdeaEditorWrapper
          saveDraft={this.saveDraft}
          storeIdea={this.storeIdea}
          topicsLabel={formatMessage({ ...messages.topicsLabel })}
          topicsPlaceholder={formatMessage({ ...messages.topicsPlaceholder })}
          areasLabel={formatMessage({ ...messages.areasLabel })}
          areasPlaceholder={formatMessage({ ...messages.areasPlaceholder })}
          storeTopics={this.storeTopics}
          storeAreas={this.storeAreas}
          topics={topics}
          loadTopicsError={loadTopicsError}
          loadingTopics={loadingTopics}
          areas={areas}
          loadAreasError={loadAreasError}
          loadingAreas={loadingAreas}
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
  topics: PropTypes.any.isRequired,
  areas: PropTypes.any.isRequired,
  intl: PropTypes.object,
  loadTopics: PropTypes.func.isRequired,
  loadingTopics: PropTypes.bool.isRequired,
  loadTopicsError: PropTypes.string,
  loadAreas: PropTypes.func.isRequired,
  loadingAreas: PropTypes.bool.isRequired,
  loadAreasError: PropTypes.string,
  handleTopicsSelect: PropTypes.func.isRequired,
  handleAreasSelect: PropTypes.func.isRequired,
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
  topics: makeSelectTopics(),
  loadingTopics: makeSelectLoadingTopics(),
  loadTopicsError: makeSelectLoadTopicsError(),
  areas: makeSelectAreas(),
  loadingAreas: makeSelectLoadingAreas(),
  loadAreasError: makeSelectLoadTopicsError(),
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

      // TODO: handle ideas and areas incl. validation

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
    loadTopics() {
      dispatch(loadTopicsRequest());
    },
    loadAreas() {
      dispatch(loadAreasRequest());
    },
    handleTopicsSelect(topics) {
      console.log(topics);
      // TODO (logic similar to attachment, images and title) to have TOPICS available when publishing
    },
    handleAreasSelect(areas) {
      console.log(areas);
      // TODO (logic similar to attachment, images and title) to have AREAS available when publishing
    },
  };
}

export default styled(injectIntl(connect(mapStateToProps, mapDispatchToProps)(IdeasNewPage)))`
  backgroundColor: '#eeeeee';
  minHeight: '850px';
  width: '100%';
  margin-top: 30px;
`;
