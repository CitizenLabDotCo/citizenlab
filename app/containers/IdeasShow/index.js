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

// NOTE: Let's use unconnected component for now
class IdeasShow extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  notFoundHtml() {
    return (<h2>Idea Not Found :/</h2>);
  }

  ideaHtml() {
    const { idea } = this.props;
    const attributes = idea.attributes;

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
  idea: PropTypes.object,
};

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(null, mapDispatchToProps)(IdeasShow);
