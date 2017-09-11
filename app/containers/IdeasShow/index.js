import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

// components
import ShowDesktop from './components/showDesktop';
import ShowMobile from './components/showMobile';
import Meta from './components/show/Meta';

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

class IdeasShow extends React.PureComponent {

  componentDidMount() {
    if (this.props.slug) {
      this.props.loadIdeaRequest({ slug: this.props.slug });
    } else if (this.props.id) {
      this.props.loadIdeaRequest({ id: this.props.id });
      this.props.loadCommentsRequest(this.props.id);
    }
  }

  componentWillUnmount() {
    this.props.resetPageData();
  }

  render() {
    const { location } = this.props;

    return (
      <div>
        <Meta location={location} slug={this.props.slug} />
        <WatchSagas sagas={sagasWatchers} />
        <DesktopVersion>
          <ShowDesktop location={location} id={this.props.id} slug={this.props.slug} />
        </DesktopVersion>
        <MobileVersion>
          <ShowMobile location={location} id={this.props.id} slug={this.props.slug} />
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
