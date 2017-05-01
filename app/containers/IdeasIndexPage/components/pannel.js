import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { bindActionCreators } from 'redux';

import { Grid, Segment } from 'semantic-ui-react';
import IdeaCard, { CardDetails } from 'components/IdeaCard';
import { createStructuredSelector } from 'reselect';

import { makeSelectIdeas } from '../selectors';
const { Column, Row } = Grid;


class IdeasCards extends React.PureComponent {
  render() {
    const { ideas, goToIdeaPage } = this.props;
    return (
      <Row>
        {ideas.toArray().map((idea) => {
          const relationships = idea.get('relationships');
          const author = relationships.getIn(['author', 'data', 'data']);
          const topics = relationships.getIn(['topics', 'data']).toArray();
          const areas = relationships.getIn(['areas', 'data']).toArray();
          const id = idea.get('id');
          return (
            <Column key={idea.get('id')} style={{ paddingTop: '0', paddingBottom: '10px' }}>
              <IdeaCard idea={idea.get('attributes')} id={id} onClick={goToIdeaPage(id)}>
                <CardDetails author={author} topics={topics} areas={areas} />
              </IdeaCard>
            </Column>
          );
        })}
      </Row>
    );
  }
}

IdeasCards.propTypes = {
  ideas: PropTypes.any.isRequired,
  goToIdeaPage: PropTypes.func.isRequired,
};


class Pannel extends React.Component {

  goToIdeaPage = (id) => {
    const self = this;
    return () => {
      self.props.push(`/ideas/${id}`);
    };
  }

  render() {
    const { ideas } = this.props;
    return (
      <Segment basic>
        <div style={{ display: 'inline-block', width: 'calc(100% - 50px) ' }}>
          <Grid columns={3}>
            <IdeasCards ideas={ideas} goToIdeaPage={this.goToIdeaPage} />
          </Grid>
        </div>
      </Segment>
    );
  }
}

Pannel.propTypes = {
  ideas: PropTypes.any.isRequired,
};

const mapStateToProps = createStructuredSelector({
  ideas: makeSelectIdeas(),
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ push }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Pannel);
