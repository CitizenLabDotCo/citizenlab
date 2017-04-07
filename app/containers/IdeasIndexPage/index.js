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
import { Row, Column, Button, Label, Reveal } from 'components/Foundation';
import styled from 'styled-components';
import makeSelectIdeasIndexPage, { makeSelectIdeas, makeSelectLoading, makeSelectNextPageItemCount, makeSelectNextPageNumber } from './selectors';
import { loadIdeas, resetIdeas, setShowIdeaWithIndexPage } from './actions';
import messages from './messages';

export class IdeasIndexPage extends React.PureComponent { // eslint-disable-line react/prefer-stateless-function
  constructor() {
    super();

    // bind event handlers
    this.goToNextPage = this.goToNextPage.bind(this);
  }

  componentWillMount() {
    this.props.initData();
  }

  componentWillUnmount() {
    this.props.resetData();
  }

  ideaShowPageHtml() {
    const idea = this.findIdeaById();
    return React.cloneElement(this.props.children, { idea });
  }

  ideaShowDialogHtml() {
    const idea = this.findIdeaById();
    return (
      <div>
        <Reveal
          className="clIdeaShowDialog"
          data-overlay="false"
          data-close-on-click="false"
          data-animation-in="slide-in-right"
          data-animation-out="slide-out-right"
          ref={(ref) => ref && ref.instance.open()}
        >
          { React.cloneElement(this.props.children, { idea }) }
        </Reveal>
      </div>
    );
  }

  findIdeaById() {
    const { ideas, params } = this.props;
    return _.find(ideas, { id: params.slug });
  }

  goToNextPage() {
    const { loadNextPage, nextPageNumber, nextPageItemCount } = this.props;
    loadNextPage(nextPageNumber, nextPageItemCount);
  }

  indexPageHtml() {
    const { ideas, nextPageNumber, loading } = this.props;

    const WrapperDiv = (props) => (
      <div
        {...props}
      >
        {!!props.children[0] && props.children}
      </div>
    );

    const CenteredDiv = styled(WrapperDiv)`
      margin: auto;
      width: 20%;
    `;

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
              <IdeaCard idea={idea} onClick={() => { this.props.dispatch(setShowIdeaWithIndexPage(true)); this.props.router.push(`/ideas/${idea.id}`); }}></IdeaCard>
            </Column>
          ))}
        </Row>
        {/* eslint-disable-next-line jsx-ally/no-static-element-interactions */}
        <CenteredDiv onClick={this.goToNextPage}>
          {(nextPageNumber && !loading) && <Button>
            <FormattedMessage
              {...messages.loadMore}
            />
          </Button>}
          {loading && <Label>
            <FormattedMessage
              {...messages.loading}
            /></Label>}
        </CenteredDiv>
      </div>
    );
  }

  render() {
    const { showIdeaWithIndexPage } = this.props.pageData;

    return (
      <div className="ideas-page">
        { (!this.props.children || showIdeaWithIndexPage === true) ? this.indexPageHtml() : null }
        { (this.props.children && showIdeaWithIndexPage === true) ? this.ideaShowDialogHtml() : null }
        { (this.props.children && showIdeaWithIndexPage === false) ? this.ideaShowPageHtml() : null }
      </div>
    );
  }
}

IdeasIndexPage.propTypes = {
  ideas: PropTypes.any.isRequired,
  params: PropTypes.object,
  children: PropTypes.any,
  router: PropTypes.object,
  initData: PropTypes.func.isRequired,
  loadNextPage: PropTypes.func.isRequired,
  resetData: PropTypes.func.isRequired,
  nextPageNumber: PropTypes.number,
  nextPageItemCount: PropTypes.number,
  loading: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  pageData: React.PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  ideas: makeSelectIdeas(),
  nextPageNumber: makeSelectNextPageNumber(),
  nextPageItemCount: makeSelectNextPageItemCount(),
  loading: makeSelectLoading(),
  pageData: makeSelectIdeasIndexPage(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    initData: () => {
      dispatch(loadIdeas(true));
    },
    loadNextPage: (nextPageNumber, nextPageItemCount) => {
      dispatch(loadIdeas(false, nextPageNumber, nextPageItemCount));
    },
    resetData: () => {
      dispatch(resetIdeas());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(IdeasIndexPage);
