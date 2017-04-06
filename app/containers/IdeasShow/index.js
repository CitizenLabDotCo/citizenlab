/*
 *
 * IdeasShow
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
// import { FormattedMessage } from 'react-intl';
import T from 'containers/T';
import { setShowIdeaWithIndexPage } from 'containers/IdeasIndexPage/actions';
// import { createStructuredSelector } from 'reselect';
// import _ from 'lodash';
// import makeSelectIdeasShow from './selectors';
// import messages from './messages';

export class IdeasShow extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  componentWillUnmount() {
    this.props.dispatch(setShowIdeaWithIndexPage(false));
  }

  notFounHtml() {
    return (<h2>Idea Not Found :/</h2>);
  }

  ideaHtml(idea) {
    return (
      <div>
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
        { idea ? this.ideaHtml(idea) : this.notFounHtml() }
      </div>
    );
  }
}

IdeasShow.propTypes = {
  dispatch: PropTypes.func.isRequired,
  idea: PropTypes.object,
};

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(null, mapDispatchToProps)(IdeasShow);
