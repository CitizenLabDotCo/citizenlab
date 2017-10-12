import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import SelectTopics from './SelectTopics';
import SelectSort from './SelectSort';
import SearchField from './SearchField';
import HelmetIntl from 'components/HelmetIntl';
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';
import Footer from 'components/Footer';

// i18n
import { injectIntl, InjectedIntlProps } from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  position: relative;
`;

const BackgroundColor = styled.div`
  position: absolute;
  top: 200px;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 0;
  background-color: #f8f8f8;
`;

const StyledContentContainer = styled(ContentContainer)`
  padding-bottom: 80px;
`;

const FiltersArea = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  height: 3.5rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  margin-bottom: 3.5rem;
  width: 100%;

  @media (min-width: 500px) {
    flex-wrap: nowrap;
  }
`;

type Props = {};

type State = {
  search: string;
  filter: object;
};

class IdeasIndex extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  search$: Rx.BehaviorSubject<string>;
  sort$: Rx.BehaviorSubject<string>;
  topics$: Rx.BehaviorSubject<string[]>;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      search: '',
      filter: {
        sort: 'trending'
      }
    };
    this.search$ = new Rx.BehaviorSubject('');
    this.sort$ = new Rx.BehaviorSubject('trending');
    this.topics$ = new Rx.BehaviorSubject([]);
  }

  componentWillMount() {
    this.subscriptions = [
      Rx.Observable.combineLatest(
        this.search$.distinctUntilChanged().do(search => this.setState({ search })).debounceTime(400),
        this.sort$,
        this.topics$
      ).subscribe(([search, sort, topics]) => {
        const filter = {};

        if (_.isString(sort) && !_.isEmpty(sort)) {
          filter['sort'] = sort;
        }

        if (_.isString(search) && !_.isEmpty(search)) {
          filter['search'] = search;
        }

        if (_.isArray(topics) && !_.isEmpty(topics)) {
          filter['topics'] = topics;
        }

        this.setState({ filter });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleSearchOnChange = (value) => {
    this.search$.next(value);
  }

  handleSortOnChange = (value) => {
    this.sort$.next(value[0]);
  }

  handleTopicsOnChange = (values) => {
    this.topics$.next(values);
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { search, filter } = this.state;

    return (
      <Container>

        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />

        <BackgroundColor />

        <StyledContentContainer>
          <FiltersArea id="e2e-ideas-filters">
            <SearchField value={search} onChange={this.handleSearchOnChange} />
            <SelectSort onChange={this.handleSortOnChange} />
            <SelectTopics onChange={this.handleTopicsOnChange} />
          </FiltersArea>
          <IdeaCards filter={filter} />
        </StyledContentContainer>

        <Footer />

      </Container>
    );
  }
}

export default injectIntl<Props>(IdeasIndex);
