import React from 'react';
import IdeaTitle from './IdeaTitle';
import IdeaContent from './IdeaContent';
import { API_PATH } from 'containers/App/constants';
import Stream from './stream';
import _ from 'lodash';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  padding-top: 40px;
  padding-bottom: 100px;
`;

class Ideas extends React.PureComponent {
  constructor() {
    super();
    this.subscriptions = [];
    this.state = { loading: true, ideas: null };

    const apiEndpoint = `${API_PATH}/ideas`;
    const queryParameters = { sort: 'trending', 'page[number]': 7, 'page[size]': 5 };
    const localProperties = { selected: false };
    this.ideasStream = Stream.create(apiEndpoint, queryParameters, localProperties);
  }

  componentDidMount() {
    this.subscriptions = [
      this.ideasStream.observable.filter((ideas) => !_.isEmpty(ideas)).subscribe((ideas) => {
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

export default Ideas;
