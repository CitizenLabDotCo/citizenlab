import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// router
import { withRouter, RouterState } from 'react-router';

// components
import IdeasShow from 'containers/IdeasShow';
import Spinner from 'components/UI/Spinner';

// services
import { ideaBySlugStream } from 'services/ideas';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Loading = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const Container = styled.div`
  background: #fff;
  margin-top: -20px;

  ${media.smallerThanMaxTablet`
    margin-top: 0px;
  `}
`;

type Props = {
  params: {
    slug: string;
  };
};

type State = {
  ideaId: string | null;
  loaded: boolean;
};

class IdeasShowPage extends React.PureComponent<Props & RouterState, State> {
  state: State;
  slug$: Rx.BehaviorSubject<string> | null;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      ideaId: null,
      loaded: false
    };
    this.slug$ = null;
    this.subscriptions = [];
  }

  componentWillMount() {
    this.slug$ = new Rx.BehaviorSubject(this.props.params.slug);

    const ideaId$ = this.slug$.switchMap(slug => ideaBySlugStream(slug).observable.map(idea => idea.data.id));

    this.subscriptions = [
      ideaId$.subscribe(ideaId => this.setState({
        ideaId,
        loaded: true
      }))
    ];
  }

  componentWillReceiveProps(newProps) {
    if (newProps.params.slug !== this.props.params.slug && this.slug$ !== null) {
      this.slug$.next(newProps.params.slug);
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { ideaId, loaded } = this.state;

    if (!loaded) {
      return (
        <Loading>
          <Spinner size="30px" color="#666" />
        </Loading>
      );
    }

    if (loaded && ideaId !== null) {
      return (
        <Container>
          <IdeasShow ideaId={ideaId} />
        </Container>
      );
    }

    return null;
  }
}

export default withRouter(IdeasShowPage as any);
