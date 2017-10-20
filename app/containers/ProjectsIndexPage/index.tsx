import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// libraries
import queryString from 'query-string';
import { withRouter, RouterState, browserHistory, Link } from 'react-router';

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
  padding-top: 30px;
  padding-bottom: 80px;
  z-index: 2;
`;

const FiltersArea = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 40px;
`;

type Props = {};

type State = {
  filter: {
    areas?: string[];
  };
};

class IdeasIndex extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  areas$: Rx.Subject<string[]>;
  subscriptions: Rx.Subscription[];
  unlisten: Function | null;

  constructor() {
    super();

    const query = browserHistory.getCurrentLocation().query;
    let filter = {};

    if (_.has(query, 'areas') && _.isString(query.areas)) {
      filter = {
        areas: [query.areas]
      };
    }

    this.state = { filter };

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

  componentWillUpdate(nextProps, nextState) {
    if (!_.isEqual(this.state.filter, nextState.filter)) {
      browserHistory.push({
        pathname: '/projects',
        query: nextState.filter
      });
    }
  }

  componentDidMount() {
    this.unlisten = browserHistory.listen((location) => {
      if (location.pathname === '/projects') {
        const filter = _.cloneDeep(location.query);
        this.setState(state => ({ filter: !_.isEqual(filter, state.filter) ? filter : state.filter }));
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
    const { formatMessage } = this.props.intl;
    const { filter } = this.state;
    let selectedAreas: string[] = [];

    if (_.has(filter, 'areas') && _.isString(filter.areas) && !_.isEmpty(filter.areas)) {
      selectedAreas = [filter.areas];
    } else if (_.has(filter, 'areas') && _.isArray(filter.areas) && !_.isEmpty(filter.areas)) {
      selectedAreas = filter.areas;
    }

    return (
      <Container>

        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />

        <BackgroundColor />

        <StyledContentContainer>
          <FiltersArea id="e2e-ideas-filters">
            <SelectAreas selectedAreas={selectedAreas} onChange={this.handleAreasOnChange} />
          </FiltersArea>
          <ProjectCards filter={filter} />
        </StyledContentContainer>

        <Footer />

      </Container>
    );
  }
}

export default injectIntl<Props>(IdeasIndex);
