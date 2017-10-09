import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// router
import { withRouter, RouterState } from 'react-router';

// components
import ContentContainer from 'components/ContentContainer';
import IdeasShow from 'containers/IdeasShow';

// services
import { ideaBySlugStream, IIdea } from 'services/ideas';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  background: #fff;
  padding-top: 60px;
  padding-bottom: 60px;
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
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      ideaId: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { slug } = this.props.params;
    const idea$ = ideaBySlugStream(slug).observable.map(idea => idea.data.id);

    this.subscriptions = [
      idea$.subscribe(ideaId => this.setState({ ideaId }))
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
        <Container>
          <ContentContainer>
              <IdeasShow location={location} ideaId={ideaId} />
          </ContentContainer>
        </Container>
      );
    }

    return null;
  }
}

export default withRouter(IdeasShowPage as any);
