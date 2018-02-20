import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isString } from 'lodash';

// components
import IdeasShow from 'containers/IdeasShow';

// services
import { ideaBySlugStream } from 'services/ideas';

// style
import styled from 'styled-components';

const Container = styled.div`
  background: #fff;
`;

type Props = {
  params: {
    slug: string;
  };
};

type State = {
  ideaId: string | null;
};

class IdeasShowPage extends React.PureComponent<Props, State> {
  slug$: Rx.BehaviorSubject<string | null>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      ideaId: null
    };
    this.slug$ = new Rx.BehaviorSubject(null);
    this.subscriptions = [];
  }

  componentDidMount() {
    this.slug$.next(this.props.params.slug);

    this.subscriptions = [
      this.slug$
        .distinctUntilChanged()
        .filter(slug => isString(slug))
        .switchMap((slug: string) => {
          return ideaBySlugStream(slug).observable;
        }).subscribe((idea) => {
          this.setState({ ideaId: idea.data.id });
        })
    ];
  }

  componentDidUpdate() {
    this.slug$.next(this.props.params.slug);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { ideaId } = this.state;

    return (
      <Container>
        <IdeasShow ideaId={ideaId} />
      </Container>
    );
  }
}

export default IdeasShowPage;
