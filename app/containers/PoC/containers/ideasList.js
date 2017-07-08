import React from 'react';
import IdeaTitle from './ideaTitle';
import IdeaContent from './ideaContent';
import styled from 'styled-components';
import IdeaListService from '../services/ideaListService';

const Container = styled.div`
  width: 100%;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  padding-top: 40px;
  padding-bottom: 100px;
`;

class IdeasList extends React.PureComponent {
  constructor() {
    super();
    this.subscriptions = [];
    this.ideasStream = IdeaListService.observe({ sort: 'trending', 'page[number]': 7, 'page[size]': 5 }, { selected: false });
    this.state = { loading: true, ideas: null };
  }

  componentDidMount() {
    this.subscriptions = [
      this.ideasStream.observable.subscribe((ideas) => {
        this.setState({ loading: false, ideas });
      }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { loading, ideas } = this.state;
    const observer = this.ideasStream.observer;

    return (
      <Container>
        <h1>Ideas</h1>
        { loading && 'Loading...' }
        { ideas && ideas.map((idea) => (
          <div key={idea.id}>
            <IdeaTitle
              id={idea.id}
              title={idea.attributes.title_multiloc.en}
              selected={idea.selected}
              observer={observer}
            />
            { idea.selected && <IdeaContent idea={idea} /> }
          </div>
        ))}
      </Container>
    );
  }
}

export default IdeasList;
