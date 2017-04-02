/*
 *
 * IdeasIndexPage
 *
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { FormattedMessage } from 'react-intl';
import { createStructuredSelector } from 'reselect';
import _ from 'lodash';
import IdeaCard from 'components/IdeaCard';
import { Row, Column } from 'components/Foundation/src/components/grid';
import { makeSelectIdeas } from './selectors';
import { loadIdeas } from './actions';
import messages from './messages';

export class IdeasIndexPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  componentWillMount() {
    this.props.dispatch(loadIdeas());
  }

  showPageHtml() {
    const { ideas, params } = this.props;
    const idea = _.find(ideas, { id: params.slug });
    return React.cloneElement(React.Children.only(this.props.children), { idea });
  }

  indexPageHtml() {
    const { ideas } = this.props;

    return (
      <div>
        <Helmet
          title="IdeasIndexPage"
          meta={[
            { name: 'description', content: 'Description of IdeasIndexPage' },
          ]}
        />

        <h1>
          <FormattedMessage {...messages.header} />
        </h1>

        <Row data-equalizer>
          {ideas && ideas.map((idea) => (
            <Column key={idea.id} small={12} medium={4} large={3}>
              <IdeaCard idea={idea} onClick={() => this.props.router.push(`/ideas/${idea.id}`)}></IdeaCard>
            </Column>
          ))}
        </Row>

      </div>
    );
  }

  render() {
    if (this.props.children) {
      return this.showPageHtml();
    }

    return this.indexPageHtml();
  }
}

IdeasIndexPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  ideas: React.PropTypes.array,
  params: React.PropTypes.object,
  children: React.PropTypes.any,
  router: React.PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  ideas: makeSelectIdeas(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(IdeasIndexPage);
