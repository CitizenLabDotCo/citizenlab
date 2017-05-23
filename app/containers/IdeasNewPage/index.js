/*
 *
 * IdeasNewPage
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { createStructuredSelector } from 'reselect';
import { Container, Label, Divider } from 'semantic-ui-react';
import styled from 'styled-components';
import Breadcrumbs from 'components/Breadcrumbs';
import { injectIntl } from 'react-intl';
import { preprocess } from 'utils/reactRedux';
import { bindActionCreators } from 'redux';
import WatchSagas from 'containers/WatchSagas';

import {
  setTitle, storeAttachment, storeImage, storeImageError, storeAttachmentError,
  publishIdeaRequest, loadTopicsRequest, loadAreasRequest, storeSelectedTopics, storeSelectedAreas, invalidForm,
} from './actions';
import IdeaEditorWrapper from './editor/IdeaEditorWrapper';
import AttachmentList from './attachments/AttachmentList';
import ImageList from './images/ImageList';
import canPublish from './editor/canPublish';
import { selectSubmitIdea } from './selectors';
import { makeSelectLocale } from '../LanguageProvider/selectors';
import { makeSelectCurrentUser } from '../../utils/auth/selectors';
import sagas from './sagas';

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
    const { loadTopicsRequest: ltr, loadAreasRequest: lar } = this.props;

    // load topics and areas
    ltr();
    lar();
  }

  sendIdea(isDraft) {
    const { content, shortTitleError, longTitleError, title, images, attachments, user, locale, selectedTopics, selectedAreas } = this.props;

    this.props.publishIdeaClick(content, shortTitleError || longTitleError, title, images, attachments, user && user.id, locale, isDraft, selectedTopics.toJS(), selectedAreas.toJS());
  }

  saveDraft() {
    this.sendIdea(true);
  }

  storeIdea() {
    this.sendIdea(false);
  }

  storeTopics(topics) {
    this.props.storeSelectedTopics(topics);
  }

  storeAreas(areas) {
    this.props.storeSelectedAreas(areas);
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

    const { className, storeAttachment: storeAtt, storeImage: storeImg, setTitle: setT } = this.props;
    return (
      <Container className={className}>
        <Helmet
          title="IdeasNewPage"
          meta={[
            { name: 'description', content: 'Description of IdeasNewPage' },
          ]}
        />
        <WatchSagas sagas={sagas} />

        <Breadcrumbs />
        <IdeaEditorWrapper
          saveDraft={this.saveDraft}
          storeIdea={this.storeIdea}
          storeTopics={this.storeTopics}
          storeAreas={this.storeAreas}
          setTitle={setT}
        />
        <StyledLabel>Add image(s)</StyledLabel>
        <ImageList
          storeImage={storeImg}
        />
        <StyledLabel>Location</StyledLabel>
        {/* TODO: location image here*/}
        <Divider />
        <StyledLabel>Attachments</StyledLabel>
        <AttachmentList
          storeAttachment={storeAtt}
        />
      </Container>
    );
  }
}

IdeasNewPage.propTypes = {
  className: PropTypes.string,
  // mapDispatch
  publishIdeaClick: PropTypes.func.isRequired,
  storeAttachment: PropTypes.func.isRequired,
  storeImage: PropTypes.func.isRequired,
  user: PropTypes.object,
  storeSelectedTopics: PropTypes.func.isRequired,
  storeSelectedAreas: PropTypes.func.isRequired,
  locale: PropTypes.string,
  loadTopicsRequest: PropTypes.func.isRequired,
  loadAreasRequest: PropTypes.func.isRequired,
  // from mergeProps
  content: PropTypes.string,
  shortTitleError: PropTypes.bool.isRequired,
  longTitleError: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  images: PropTypes.any.isRequired,
  attachments: PropTypes.any.isRequired,
  selectedTopics: PropTypes.any.isRequired,
  selectedAreas: PropTypes.any.isRequired,
  setTitle: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  ideasNewPageState: selectSubmitIdea,
  locale: makeSelectLocale(),
  user: makeSelectCurrentUser(),
});

const customActionCreators = {
  publishIdeaClick(content, titleError, title, images, attachments, userId, locale, isDraft, topics, areas) {
    const contentNotNull = content || '<p></p>';

    if (canPublish(contentNotNull, titleError, topics, areas)) {
      // inject strings for current locale as a mutiloc object
      const htmlContents = {};
      const titles = {};
      htmlContents[locale] = contentNotNull;
      titles[locale] = title;

      return publishIdeaRequest(htmlContents, titles, images, attachments, userId, isDraft, topics, areas);
    }
    return invalidForm();
  },
  setTitle(e) {
    return setTitle(e.target.value);
  },
  storeAttachment(file) {
    if (file) {
      return storeAttachment(file);
    }
    return storeAttachmentError();
  },
  storeImage(file) {
    if (file) {
      return storeImage(file);
    }
    return storeImageError();
  },
};

export const mapDispatchToProps = (dispatch) => bindActionCreators({
  /*
   * auto-binding
   */
  loadTopicsRequest,
  loadAreasRequest,
  storeSelectedTopics,
  storeSelectedAreas,
  /*
   * manual bindings
   * (return actions to dispatch - with custom logic)
   */
  ...customActionCreators,
}, dispatch);

const mergeProps = ({ ideasNewPageState: pageState, locale, user }, dispatchProps) => ({
  content: pageState.getIn(['draft', 'content']),
  longTitleError: pageState.getIn(['draft', 'longTitleError']),
  shortTitleError: pageState.getIn(['draft', 'shortTitleError']),
  title: pageState.getIn(['draft', 'title']),
  images: pageState.getIn(['draft', 'images']),
  attachments: pageState.getIn(['draft', 'attachments']),
  selectedTopics: pageState.getIn(['topics', 'selected']),
  selectedAreas: pageState.getIn(['areas', 'selected']),
  locale,
  user,
  ...dispatchProps,
});

// preprocess to avoid unnecessary re-renders when using mapDispatchToProps
export default styled(injectIntl(preprocess(mapStateToProps, mapDispatchToProps, mergeProps)(IdeasNewPage)))`
  backgroundColor: '#eeeeee';
  minHeight: '850px';
  width: '100%';
  margin-top: 30px;
`;