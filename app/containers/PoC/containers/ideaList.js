import React from 'react';
import Rx from 'rxjs/Rx';
import _ from 'lodash';
import IdeaTitle from './ideaTitle';
import IdeaContent from './ideaContent';
import IdeasTable from './ideasTable';
import styled from 'styled-components';
import { observeMultipleIdeas, toggleIdea } from '../services/ideaService';

const Container = styled.div`
  width: 100%;
  max-width: 580px;
  margin-left: auto;
  margin-right: auto;
  padding-top: 50px;
  padding-bottom: 100px;
`;

const Title = styled.div`
  font-size: 32px;
  font-weight: 300;
  padding: 20px;
  padding-left: 0px;
`;

const Ideas = styled.div`
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0px 0px 1px 1px rgba(0, 0, 0, 0.1);
`;

const Idea = styled.div`
  border-bottom: solid 1px #eee;
`;

const LoadMoreBtn = styled.div`
  width: 100%;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  padding: 15px;
  margin-top: 10px;
  border-radius: 5px;
  cursor: pointer;
  background: #e0e0e0;

  &:hover {
    background: #ccc;
  }
`;

class IdeaList extends React.PureComponent {
  constructor() {
    super();
    this.state = { loading: true, ideas: null };
    this.queryParams = { sort: 'trending', 'page[number]': 1, 'page[size]': 5 };
    this.localProps = { selected: false };
    this.streams = [observeMultipleIdeas(this.queryParams, this.localProps)];
    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions = [
      this.streams[0].observable.subscribe((ideas) => {
        this.setState({ loading: false, ideas });
      }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  loadMore = () => {
    const pageNumber = (this.streams.length + 2);
    const queryParams = { ...this.queryParams, 'page[number]': pageNumber };
    this.streams.push(observeMultipleIdeas(queryParams, this.localProps));

    this.subscriptions.push(
      Rx.Observable.combineLatest(
        this.streams.map((stream) => stream.observable),
        (...args) => _.flatten(args)
      ).subscribe((ideas) => {
        if (this.subscriptions.length === 2) {
          this.subscriptions[0].unsubscribe();
          this.subscriptions = [this.subscriptions[1]];
        }

        this.setState({ ideas });
      })
    );
  }

  handleOnClick = (id) => {
    const observers = this.streams.map((stream) => stream.observer);
    toggleIdea(observers, id);
  }

  render() {
    const { loading, ideas } = this.state;

    return (
      <Container>
        <Title>Ideas</Title>
        <Ideas>
          { loading && 'Loading...' }
          { ideas && ideas.map((idea) => (
            <Idea key={idea.id}>
              <IdeaTitle
                id={idea.id}
                title={idea.attributes.title_multiloc.en}
                selected={idea.selected}
                onClick={this.handleOnClick}
              />
              <IdeaContent idea={idea} />
            </Idea>
          )) }
        </Ideas>
        <LoadMoreBtn onClick={this.loadMore}>Load more ideas</LoadMoreBtn>

        <IdeasTable />
      </Container>
    );
  }
}

export default IdeaList;
