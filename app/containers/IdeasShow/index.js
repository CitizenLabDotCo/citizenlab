/*
 *
 * IdeasShow
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

// components
import ShowDesktop from './components/showDesktop';
import ShowMobile from './components/showMobile';

// store
import { preprocess } from 'utils';
import WatchSagas from 'containers/WatchSagas';
import sagasWatchers from './sagas';
import { loadCommentsRequest, loadIdeaRequest, resetPageData } from './actions';

const DesktopVersion = styled.div`
  ${media.phone`
    display: none;
  `}
`;

const MobileVersion = styled.div`
  ${media.notPhone`
    display: none;
  `}
`;

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
    if (this.id) {
      this.props.loadCommentsRequest(this.id);
    }
  }

  componentWillUnmount() {
    this.props.resetPageData();
  }

  render() {
    const { location } = this.props;

    return (
      <div>
        <WatchSagas sagas={sagasWatchers} />
        <DesktopVersion>
          <ShowDesktop location={location} id={this.id} slug={this.slug} />
        </DesktopVersion>
        <MobileVersion>
          <ShowMobile location={location} id={this.id} slug={this.slug} />
        </MobileVersion>
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
