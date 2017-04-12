/*
 *
 * IdeasShow
 *
 */

import React, { PropTypes } from 'react';
import Helmet from 'react-helmet';
import T from 'containers/T';
import { connect } from 'react-redux';
import ImageCarousel from 'components/ImageCarousel';
import { setShowIdeaWithIndexPage } from 'containers/IdeasIndexPage/actions';
import { createStructuredSelector } from 'reselect';
import {
  loadIdea,
  loadIdeaSuccess,
} from './actions';
import makeSelectIdeasShow from './selectors';

export class IdeasShow extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentDidMount() {
    if (this.props.showIdeaWithIndexPage === false) {
      this.props.dispatch(loadIdea(this.props.params.slug));
    }
  }

  componentWillUnmount() {
    this.props.dispatch(setShowIdeaWithIndexPage(false));

    if (this.props.showIdeaWithIndexPage === false) {
      this.props.dispatch(loadIdeaSuccess(null));
    }
  }

  notFoundHtml() {
    return (<h2>Idea Not Found :/</h2>);
  }

  ideaHtml(idea) {
    const { attributes } = idea;

    return (
      <div>
        {attributes.images && attributes.images.length > 0 && <ImageCarousel
          ideaImages={attributes.images}
        />}
        <h2><T value={attributes.title_multiloc} /></h2>
        <p><strong>Some Author</strong></p>
        <div dangerouslySetInnerHTML={{ __html: attributes.body_multiloc.en }}></div>
      </div>
    );
  }

  render() {
    const idea = this.props.idea || this.props.pageData.idea;
    return (
      <div>
        <Helmet
          title="IdeasShow"
          meta={[
            { name: 'description', content: 'Description of IdeasShow' },
          ]}
        />
        { idea ? this.ideaHtml(idea) : this.notFoundHtml() }
      </div>
    );
  }
}

IdeasShow.propTypes = {
  dispatch: PropTypes.func.isRequired,
  idea: PropTypes.object,
  pageData: PropTypes.object,
  showIdeaWithIndexPage: PropTypes.bool,
  params: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  pageData: makeSelectIdeasShow(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(IdeasShow);
