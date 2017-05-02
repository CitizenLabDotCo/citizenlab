import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';

import { Grid, Segment, Button } from 'semantic-ui-react';
import IdeaCard, { ResourceDetail, AuthorDetail } from 'components/IdeaCard';
import { injectTFunc } from 'containers/T/utils'
import { loadNextPage } from '../actions'
import { makeSelectIdeas, selectIdeasIndexPageDomain } from '../selectors';
import messages from '../messages'
const { Column, Row } = Grid;

class UnconnectedIdeasCards extends React.PureComponent {

  goToIdeaPage = (id) => {
    this.props.push(`/ideas/${id}`);
  }

  render() {
    const { ideas } = this.props;
    return (
      <Row>
        {ideas.toArray().map((idea) => {
          const relationships = idea.get('relationships');
          const author = relationships.getIn(['author', 'data', 'data']);
          const topics = relationships.getIn(['topics', 'data']).toArray();
          const areas = relationships.getIn(['areas', 'data']).toArray();
          const id = idea.get('id');
          return (
            <Column key={id} style={{ paddingTop: '0', paddingBottom: '10px' }}>
              <IdeaCard idea={idea.get('attributes')} id={id} onClick={this.goToIdeaPage} >
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

UnconnectedIdeasCards.propTypes = {
  ideas: React.PropTypes.any.isRequired,
};

const mapIdeasCardsStateToProps = createStructuredSelector({
  ideas: makeSelectIdeas(),
});

const mapIdeasCardsDispatchToProps = (dispatch) => bindActionCreators({ push }, dispatch);


const IdeasCards = connect(mapIdeasCardsStateToProps, mapIdeasCardsDispatchToProps)(UnconnectedIdeasCards);


class Panel extends React.Component {
  constructor() {
    super();
    this.goToNextPage = this.goToNextPage.bind(this)
  }

  shouldComponentUpdate() {
    return false;
  }

  goToNextPage() {
    const { nextPageNumber, nextPageItemCount } = this.props;
    this.props.loadNextPage(nextPageNumber, nextPageItemCount);
  }

  render() {
    const { tFunc } = this.props;
    const loadMoreMessage = tFunc(messages.loadMore)
    return (
      <Segment basic>
        <div style={{ display: 'inline-block', width: 'calc(100% - 50px) ' }}>
          <Grid columns={3}>
            <IdeasCards />
          </Grid>
        </div>
        <Button
          content={loadMoreMessage}
          fluid icon={'right arrow'}
          labelPosition={'right'}
          onClick={this.goToNextPage}
        />
      </Segment>
    );
  }
}

Panel.propTypes = {
  loadNextPage: React.PropTypes.func.isRequired,
  nextPageNumber: React.PropTypes.any,
  nextPageItemCount: React.PropTypes.any,
};

const mapStateToProps = createStructuredSelector({
  nextPageNumber: selectIdeasIndexPageDomain('nextPageNumber'),
  nextPageItemCount: selectIdeasIndexPageDomain('nextPageItemCount'),
});


const mapDispatchToProps = (dispatch) => bindActionCreators({ loadNextPage }, dispatch);

export default injectTFunc(connect(mapStateToProps, mapDispatchToProps)(Panel));
