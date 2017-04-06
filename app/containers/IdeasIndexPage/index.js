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
import { Row, Column, Button, Label } from 'components/Foundation';
import styled from 'styled-components';
import { makeSelectIdeas, makeSelectLoading, makeSelectNextPageItemCount, makeSelectNextPageNumber } from './selectors';
import { loadIdeas, resetIdeas } from './actions';
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

  showPageHtml() {
    const { ideas, params } = this.props;
    const idea = _.find(ideas, { id: params.slug });
    return React.cloneElement(React.Children.only(this.props.children), { idea });
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
              <IdeaCard idea={idea} onClick={() => this.props.router.push(`/ideas/${idea.id}`)}></IdeaCard>
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
    if (this.props.children) {
      return this.showPageHtml();
    }

    return this.indexPageHtml();
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
};

const mapStateToProps = createStructuredSelector({
  ideas: makeSelectIdeas(),
  nextPageNumber: makeSelectNextPageNumber(),
  nextPageItemCount: makeSelectNextPageItemCount(),
  loading: makeSelectLoading(),
});

function mapDispatchToProps(dispatch) {
  return {
    initData: () => {
      dispatch(loadIdeas());
    },
    loadNextPage: (nextPageNumber, nextPageItemCount) => {
      dispatch(loadIdeas(nextPageNumber, nextPageItemCount));
    },
    resetData: () => {
      dispatch(resetIdeas());
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(IdeasIndexPage);
