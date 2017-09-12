import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// router
import { withRouter, RouterState } from 'react-router';

// components
import ContentContainer from 'components/ContentContainer';
import IdeasShow from 'containers/IdeasShow';

// services
import { state, IStateStream } from 'services/state';
import { ideaBySlugStream, IIdea } from 'services/ideas';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const BackgroundWrapper = styled.div`
  margin: 50px 0;

  ${media.notPhone`
    border-radius: 5px;
    background-color: #ffffff;
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

const namespace = 'IdeasShowPage/index';

class IdeasShowPage extends React.PureComponent<Props & RouterState, State> {
  state$: IStateStream<State>;
  subscriptions: Rx.Subscription[];

  componentWillMount() {
    const { slug } = this.props.params;
    const initialState: State = { ideaId: null };

    this.state$ = state.createStream<State>(namespace, namespace, initialState);

    this.subscriptions = [
      this.state$.observable.subscribe(state => this.setState(state)),
      ideaBySlugStream(slug).observable.map(idea => idea.data.id).subscribe(ideaId => this.state$.next({ ideaId }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { location } = this.props;
    const { ideaId } = this.state;

    if (ideaId !== null) {
      return (
        <ContentContainer>
          <BackgroundWrapper>
            <IdeasShow location={location} ideaId={ideaId} />
          </BackgroundWrapper>
        </ContentContainer>
      );
    }

    return null;
  }
}

export default withRouter(IdeasShowPage as any);
