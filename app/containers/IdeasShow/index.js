/*
 *
 * IdeasShow
 *
 */

import React from 'react';
import PropTypes from 'prop-types';

// components
import Show from './components/show';

// store
import { preprocess } from 'utils';
import WatchSagas from 'containers/WatchSagas';
import sagasWatchers from './sagas';
import { loadCommentsRequest, loadIdeaRequest, resetPageData } from './actions';

// Ideas show does not use helmet at this view is controlled by RouterIndexShow
class IdeasShow extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor(props) {
    super();

    const { params } = props;
    if (props.slug || params.slug) {
      this.slug = props.slug || params.slug;
    } else if (props.id) {
      this.id = props.id;
    }
  }

  componentDidMount() {
    if (this.slug) {
      this.props.loadIdeaRequest({ slug: this.slug });
    } else if (this.id) {
      this.props.loadIdeaRequest({ id: this.id });
    }

    this.props.loadCommentsRequest(this.id);
  }

  componentWillUnmount() {
    this.props.resetPageData();
  }

  render() {
    const { location } = this.props;

    return (
      <div>
        <WatchSagas sagas={sagasWatchers} />
        <Show location={location} id={this.id} slug={this.slug} />
      </div>
    );
  }
}

IdeasShow.propTypes = {
  loadIdeaRequest: PropTypes.func.isRequired,
  loadCommentsRequest: PropTypes.func,
  params: PropTypes.object,
  slug: PropTypes.string,
  resetPageData: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  id: PropTypes.string,
};

export default preprocess(null, { loadIdeaRequest, loadCommentsRequest, resetPageData })(IdeasShow);
