import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { has, isString, isEmpty, isEqual, isArray, cloneDeep } from 'lodash';

// libraries
import { browserHistory } from 'react-router';

// components
import SelectAreas from './SelectAreas';
import ContentContainer from 'components/ContentContainer';
import ProjectCards from 'components/ProjectCards';
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
    background: #f8f8f8;
  `}
`;

const BackgroundColor = styled.div`
  position: absolute;
  top: 200px;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 0;
  background-color: #f8f8f8;

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
  justify-content: flex-end;
  margin-top: 30px;
  margin-bottom: 35px;

  ${media.smallerThanMaxTablet`
    margin: 0;
    margin-top: 10px;
    margin-bottom: 30px;
    justify-content: space-between;
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

type Props = {};

type State = {
  filter: {
    areas?: string[];
  };
};

class IdeasIndex extends React.PureComponent<Props, State> {
  state: State;
  areas$: Rx.Subject<string[]>;
  subscriptions: Rx.Subscription[];
  unlisten: Function | null;

  constructor(props: Props) {
    super(props as any);

    const query = browserHistory.getCurrentLocation().query;
    let filter = {};

    if (has(query, 'areas') && isString(query.areas)) {
      filter = {
        areas: [query.areas]
      };
    }

    this.state = { filter };
    this.subscriptions = [];
    this.areas$ = new Rx.Subject();
  }

  componentWillMount() {
    this.subscriptions = [
      this.areas$.subscribe((areas) => {
        this.setState((state) => ({
          filter: {
            ...state.filter,
            areas
          }
        }));
      })
    ];
  }

  componentWillUpdate(_nextProps, nextState) {
    if (!isEqual(this.state.filter, nextState.filter)) {
      browserHistory.push({
        pathname: '/projects',
        query: nextState.filter
      });
    }
  }

  componentDidMount() {
    this.unlisten = browserHistory.listen((location) => {
      if (location.pathname === '/projects') {
        const filter = cloneDeep(location.query);
        this.setState(state => ({ filter: !isEqual(filter, state.filter) ? filter : state.filter }));
      }
    });
  }

  componentWillUnmount() {
    if (this.unlisten !== null) {
      this.unlisten();
    }

    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleAreasOnChange = (values: string[]) => {
    this.areas$.next(values);
  }

  render() {
    const { filter } = this.state;
    let selectedAreas: string[] = [];

    if (has(filter, 'areas') && isString(filter.areas) && !isEmpty(filter.areas)) {
      selectedAreas = [filter.areas];
    } else if (has(filter, 'areas') && isArray(filter.areas) && !isEmpty(filter.areas)) {
      selectedAreas = filter.areas;
    }

    return (
      <Container>

        <BackgroundColor />

        <StyledContentContainer>
          <FiltersArea id="e2e-ideas-filters">
            <PageTitle><FormattedMessage {...messages.pageTitle} /></PageTitle>

            <FilterArea>
              <SelectAreas selectedAreas={selectedAreas} onChange={this.handleAreasOnChange} />
            </FilterArea>
          </FiltersArea>
          <ProjectCards filter={filter} />
        </StyledContentContainer>

        <Footer />

      </Container>
    );
  }
}

export default IdeasIndex;
