import * as React from 'react';
// import * as Rx from 'rxjs/Rx';
// import { isString, isEmpty, isArray } from 'lodash';

// components
// import SelectTopics from './SelectTopics';
// import SelectSort from './SelectSort';
// import SearchInput from 'components/UI/SearchInput';
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';
import Footer from 'components/Footer';

// i18n
// import { FormattedMessage } from 'utils/cl-intl';
// import messages from './messages';

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
    background: #f9f9fa;
  `}
`;

const BackgroundColor = styled.div`
  position: absolute;
  top: 200px;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 0;
  background: #f9f9fa;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const StyledContentContainer = styled(ContentContainer)`
  padding-bottom: 80px;
`;

type Props = {};

type State = {
  // search: string;
  // filter: object;
};

export default class IdeasIndex extends React.PureComponent<Props, State> {
  // search$: Rx.BehaviorSubject<string>;
  // sort$: Rx.BehaviorSubject<string>;
  // topics$: Rx.BehaviorSubject<string[]>;
  // subscriptions: Rx.Subscription[];

  // constructor(props: Props) {
  //   super(props as any);
  //   this.state = {
  //     search: '',
  //     filter: {
  //       sort: 'trending'
  //     }
  //   };
  //   this.search$ = new Rx.BehaviorSubject('');
  //   this.sort$ = new Rx.BehaviorSubject('trending');
  //   this.topics$ = new Rx.BehaviorSubject([]);
  // }

  // componentDidMount() {
  //   this.subscriptions = [
  //     Rx.Observable.combineLatest(
  //       this.search$.distinctUntilChanged().do(search => this.setState({ search })).debounceTime(400),
  //       this.sort$,
  //       this.topics$
  //     ).subscribe(([search, sort, topics]) => {
  //       const filter = {};

  //       if (isString(sort) && !isEmpty(sort)) {
  //         filter['sort'] = sort;
  //       }

  //       if (isString(search) && !isEmpty(search)) {
  //         filter['search'] = search;
  //       }

  //       if (isArray(topics) && !isEmpty(topics)) {
  //         filter['topics'] = topics;
  //       }

  //       this.setState({ filter });
  //     })
  //   ];
  // }

  // componentWillUnmount() {
  //   this.subscriptions.forEach(subscription => subscription.unsubscribe());
  // }

  // handleSearchOnChange = (value) => {
  //   this.search$.next(value);
  // }

  // handleSortOnChange = (value) => {
  //   this.sort$.next(value[0]);
  // }

  // handleTopicsOnChange = (values) => {
  //   this.topics$.next(values);
  // }

  render() {
    return (
      <Container>

        <BackgroundColor />

        <StyledContentContainer>
          <IdeaCards />
        </StyledContentContainer>

        <Footer />

      </Container>
    );
  }
}
