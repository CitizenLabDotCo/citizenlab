import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isString, isEmpty, isArray } from 'lodash';

// components
import SelectTopics from './SelectTopics';
import SelectSort from './SelectSort';
import SearchInput from 'components/UI/SearchInput';
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';
import Footer from 'components/Footer';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  position: relative;

  ${media.smallerThanMaxTablet`
    background: #f6f6f6;
  `}
`;

const BackgroundColor = styled.div`
  position: absolute;
  top: 200px;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 0;
  background: #f6f6f6;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const StyledContentContainer = styled(ContentContainer)`
  padding-bottom: 80px;
`;

const FiltersArea = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 30px;
  margin-bottom: 35px;

  ${media.smallerThanMaxTablet`
    margin: 0;
    margin-top: 10px;
    margin-bottom: 30px;
  `}
`;

const PageTitle = styled.h1`
  height: 60px;
  color: #333;
  font-size: 28px;
  line-height: 32px;
  font-weight: 500;
  margin: 0;
  padding: 0;
  display: none;

  ${media.smallerThanMaxTablet`
    display: flex;
    align-items: flex-end;
  `}
`;

const FilterArea = styled.div`
  height: 60px;
  display: flex;
  align-items: center;

  ${media.smallerThanMaxTablet`
    align-items: flex-end;
  `}
`;

const SearchFilterArea = FilterArea.extend`
  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const SelectFilterArea = FilterArea.extend``;

const StyledSearchInput = styled(SearchInput)`
  width: 300px;

  input {
    font-size: 18px;
    font-weight: 400;
  }

  ${media.smallerThanMaxTablet`
    width: 100%;
  `}
`;

type Props = {};

type State = {
  search: string;
  filter: object;
};

export default class IdeasIndex extends React.PureComponent<Props, State> {
  search$: Rx.BehaviorSubject<string>;
  sort$: Rx.BehaviorSubject<string>;
  topics$: Rx.BehaviorSubject<string[]>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
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

        if (isString(sort) && !isEmpty(sort)) {
          filter['sort'] = sort;
        }

        if (isString(search) && !isEmpty(search)) {
          filter['search'] = search;
        }

        if (isArray(topics) && !isEmpty(topics)) {
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
    const { search, filter } = this.state;

    return (
      <Container>

        <BackgroundColor />

        <StyledContentContainer>

          <FiltersArea id="e2e-ideas-filters">
            <PageTitle>
              <FormattedMessage {...messages.pageTitle} />
            </PageTitle>

            <SearchFilterArea>
              <StyledSearchInput value={search} onChange={this.handleSearchOnChange} />
            </SearchFilterArea>

            <SelectFilterArea>
              <SelectSort onChange={this.handleSortOnChange} />
              <SelectTopics onChange={this.handleTopicsOnChange} />
            </SelectFilterArea>
          </FiltersArea>
          <IdeaCards filter={filter} />
        </StyledContentContainer>

        <Footer />

      </Container>
    );
  }
}
