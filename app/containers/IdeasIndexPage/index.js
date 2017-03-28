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
import IdeaCard from 'components/IdeaCard';
import { Row, Column } from 'components/Foundation/src/components/grid';
import { makeSelectIdeas } from './selectors';
import { loadIdeas } from './actions';
import messages from './messages';

export class IdeasIndexPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function

  componentWillMount() {
    this.props.dispatch(loadIdeas());
  }

  render() {
    const { ideas } = this.props;
    return (
      <div>
        <Helmet
          title="IdeasIndexPage"
          meta={[
            { name: 'description', content: 'Description of IdeasIndexPage' },
          ]}
        />
        <FormattedMessage {...messages.header} />
        <Row data-equalizer>
          {ideas && ideas.map((idea) => (
            <Column key={idea.id} small={12} medium={4} large={3}>
              <IdeaCard idea={idea}></IdeaCard>
            </Column>
          ))}
        </Row>

      </div>
    );
  }
}

IdeasIndexPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
  ideas: React.PropTypes.array,
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
