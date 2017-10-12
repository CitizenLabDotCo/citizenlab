import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import SelectAreas from './SelectAreas';
import HelmetIntl from 'components/HelmetIntl';
import SearchInput from 'components/UI/SearchInput';
import ContentContainer from 'components/ContentContainer';
import ProjectCards from 'components/ProjectCards';
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
  z-index: 2;
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
  areas$: Rx.BehaviorSubject<string[]>;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      search: '',
      filter: {}
    };
    this.search$ = new Rx.BehaviorSubject('');
    this.areas$ = new Rx.BehaviorSubject([]);
  }

  componentWillMount() {
    this.subscriptions = [
      Rx.Observable.combineLatest(
        this.search$.distinctUntilChanged().do(search => this.setState({ search })).debounceTime(400),
        this.areas$
      ).subscribe(([search, areas]) => {
        const filter = {};

        if (_.isString(search) && !_.isEmpty(search)) {
          filter['search'] = search;
        }

        if (_.isArray(areas) && !_.isEmpty(areas)) {
          filter['areas'] = areas;
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

  handleAreasOnChange = (values) => {
    this.areas$.next(values);
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
            {/* <SearchInput value={search} onChange={this.handleSearchOnChange} /> */}
            <SelectAreas onChange={this.handleAreasOnChange} />
          </FiltersArea>
          <ProjectCards filter={filter} />
        </StyledContentContainer>

        <Footer />

      </Container>
    );
  }
}

export default injectIntl<Props>(IdeasIndex);
