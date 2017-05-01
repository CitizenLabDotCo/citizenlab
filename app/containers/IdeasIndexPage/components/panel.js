import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';
import { Map } from 'Immutable';

import { Grid, Segment } from 'semantic-ui-react';
import IdeaCard, { ResourceDetail, AuthorDetail } from 'components/IdeaCard';

import { makeSelectIdeas } from '../selectors';
const { Column, Row } = Grid;

class Wrapper extends React.PureComponent {
  render() {
    return (
      <span>
      </span>
    );
  }
}


class IdeasCards extends React.PureComponent {
  constructor() {
    super();
    this.wrappers = [];
  }

  manageWrapper = (wrapper, i, newProps) => {
    if (this.wrappers[i]) {
      this.wrappers[i].setState(newProps);
      return this.wrappers[i];
    }
    this.wrappers[i] = wrapper;
    return this.wrappers[i];
  }


  render() {
    const { ideas, goToIdeaPage } = this.props;
    return (
      <Row>
        {ideas.toArray().map((idea, i) => {
          const relationships = idea.get('relationships');
          const author = relationships.getIn(['author', 'data', 'data']);
          const topics = relationships.getIn(['topics', 'data']).toArray();
          const areas = relationships.getIn(['areas', 'data']).toArray();
          const id = idea.get('id');
          return (
            <Column key={id} style={{ paddingTop: '0', paddingBottom: '10px' }}>
              <IdeaCard idea={idea.get('attributes')} id={id} onClick={goToIdeaPage} >
                <AuthorDetail author={author} key={'author'} />
                <ResourceDetail resource={topics} key={'topics'} />
                <ResourceDetail resource={areas} key={'areas'} />
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


class Panel extends React.Component {

  goToIdeaPage = () => {
    this.props.push(`/ideas/${id}`);
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

Panel.propTypes = {
  ideas: PropTypes.any.isRequired,
};

const mapStateToProps = createStructuredSelector({
  ideas: makeSelectIdeas(),
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ push }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Panel);
