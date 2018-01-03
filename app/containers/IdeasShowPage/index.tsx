import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// router
import { withRouter, RouterState } from 'react-router';

// components
import IdeasShow from 'containers/IdeasShow';
import Footer from 'components/Footer';

// services
import { ideaBySlugStream, IIdea } from 'services/ideas';

// style
import styled, { css } from 'styled-components';
import { media } from 'utils/styleUtils';

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
};

class IdeasShowPage extends React.PureComponent<Props & RouterState, State> {
  state: State;
  slug$: Rx.BehaviorSubject<string> | null;
  subscription: Rx.Subscription | null;

  constructor(props: Props) {
    super(props as any);
    this.state = { ideaId: null };
    this.slug$ = null;
    this.subscription = null;
  }

  componentWillMount() {
    this.slug$ = new Rx.BehaviorSubject(this.props.params.slug);
    const ideaId$ = this.slug$.switchMap(slug => ideaBySlugStream(slug).observable.map(idea => idea.data.id));
    this.subscription = ideaId$.subscribe(ideaId => this.setState({ ideaId }));
  }

  componentWillReceiveProps(newProps) {
    if (newProps.params.slug !== this.props.params.slug && this.slug$ !== null) {
      this.slug$.next(newProps.params.slug);
    }
  }

  componentWillUnmount() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }

  render() {
    const { location } = this.props;
    const { ideaId } = this.state;

    if (ideaId !== null) {
      return (
        <Container>
          <IdeasShow ideaId={ideaId} />
          {/* <Footer showCityLogoSection={false} /> */}
        </Container>
      );
    }

    return null;
  }
}

export default withRouter(IdeasShowPage as any);
