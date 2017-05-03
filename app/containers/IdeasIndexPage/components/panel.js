import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { bindActionCreators } from 'redux';
import { createStructuredSelector } from 'reselect';

import { Grid, Segment, Button } from 'semantic-ui-react';
import IdeaCard from 'components/IdeaCard';
import { injectTFunc } from 'containers/T/utils'
import { loadNextPage } from '../actions'
import selectIdeasIndexPageDomain from '../selectors';

import messages from '../messages'
const { Column, Row } = Grid;

class UnconnectedIdeasCards extends React.Component {

  goToIdeaPage = (id) => {
    this.props.push(`/ideas/${id}`);
  }

  render() {
    const ideas = this.props.ideas.toArray();
    return (
      <Row>
        {ideas.map((ideaId) => {
          return (
            <Column key={ideaId} style={{ paddingTop: '0', paddingBottom: '10px' }}>
              <IdeaCard id={ideaId} onClick={this.goToIdeaPage} />
            </Column>
          );
        })}
      </Row>
    );
  }
}

//                <AuthorDetail author={author} key={'author'} />
//                <ResourceDetail resource={topics} key={'topics'} />
//              <ResourceDetail resource={areas} key={'areas'} />

UnconnectedIdeasCards.propTypes = {
  ideas: React.PropTypes.any.isRequired,
};

const mapIdeasCardsStateToProps = createStructuredSelector({
  ideas: selectIdeasIndexPageDomain('ideas'),
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
