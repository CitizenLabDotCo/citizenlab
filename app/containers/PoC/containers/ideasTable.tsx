import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import { observeIdeas, IIdeas } from 'services/ideas';
import styledComponents from 'styled-components';
const styled = styledComponents;

const Container = styled.div`
  margin-top: 50px;
`;

const StyledTable = styled.table`
  background: #fff;

  tr {
    border: solid 1px #ccc;

    th, td {
      padding: 10px;
    }
  }
`;

type Props = {};

type State = {
  ideas: IIdeas | null
  pageNumber: number;
};

export default class IdeasTable extends React.PureComponent<Props, State> {
  queryParams: {};
  subscription: Rx.Subscription;

  constructor() {
    super();
    const pageNumber = 1;
    this.state = { pageNumber, ideas: null };
    this.queryParams = { sort: 'trending', 'page[number]': pageNumber, 'page[size]': 5 };
  }

  componentDidMount() {
    this.subscription = observeIdeas({ queryParameters: this.queryParams }).observable.subscribe((ideas) => {
      console.log(ideas);
      this.setState({ ideas });
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  goToPage(page: 'previous' | 'next' | number) {
    this.subscription.unsubscribe();

    this.setState((state) => {
      let pageNumber = state.pageNumber;

      if (page === 'next') {
        pageNumber = state.pageNumber + 1;
      } else if (page === 'previous' && state.pageNumber > 1) {
        pageNumber = state.pageNumber - 1;
      } else if (_.isNumber(page)) {
        pageNumber = page;
      }

      const queryParameters = { ...this.queryParams, 'page[number]': pageNumber };

      this.subscription = observeIdeas({ queryParameters }).observable.subscribe((ideas) => {
        this.setState({ ideas });
      });

      return { pageNumber };
    });
  }

  goToPrevPage = () => {
    this.goToPage('previous');
  }

  goToNextPage = () => {
    this.goToPage('next');
  }

  render () {
    const { ideas } = this.state;

    return (
      <Container>
        <StyledTable>
          <thead>
            <tr>
              <th>Author</th>
              <th>Title</th>
            </tr>
          </thead>

          <tbody>
            { ideas && ideas.data.map((idea) => (
              <tr key={idea.id}>
                <td>{idea.attributes.author_name}</td>
                <td>{idea.attributes.title_multiloc.en}</td>
              </tr>
            )) }
          </tbody>
        </StyledTable>

        <button onClick={this.goToPrevPage}>Previous</button>
        <button onClick={this.goToNextPage}>Next</button>
      </Container>
    );
  }
}
