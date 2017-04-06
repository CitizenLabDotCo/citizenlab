/*
 *
 * IdeasShow
 *
 */

import React, { PropTypes } from 'react';
// import { connect } from 'react-redux';
import Helmet from 'react-helmet';
// import { FormattedMessage } from 'react-intl';
import T from 'containers/T';
import ImageCarousel from '../../components/ImageCarousel/index';
// import { createStructuredSelector } from 'reselect';
// import _ from 'lodash';
// import makeSelectIdeasShow from './selectors';
// import messages from './messages';

// NOTE: Let's use unconnected component for now
export default class IdeasShow extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  notFoundHtml() {
    return (<h2>Idea Not Found :/</h2>);
  }

  ideaHtml() {
    const { idea } = this.props;
    return (
      <div>
        <ImageCarousel />
        <h2><T value={idea.attributes.title_multiloc} /></h2>
        <p><strong>Some Author</strong></p>
        <div dangerouslySetInnerHTML={{ __html: idea.attributes.body_multiloc.en }}></div>
      </div>
    );
  }

  render() {
    const { idea } = this.props;
    return (
      <div>
        <Helmet
          title="IdeasShow"
          meta={[
            { name: 'description', content: 'Description of IdeasShow' },
          ]}
        />
        { idea ? this.ideaHtml() : this.notFoundHtml() }
      </div>
    );
  }
}

IdeasShow.propTypes = {
  // dispatch: PropTypes.func.isRequired,
  idea: PropTypes.object,
};

// const mapStateToProps = createStructuredSelector({
//   IdeasShow: makeSelectIdeasShow(),
// });
//
// function mapDispatchToProps(dispatch) {
//   return {
//     dispatch,
//   };
// }
//
// export default connect(mapStateToProps, mapDispatchToProps)(IdeasShow);
