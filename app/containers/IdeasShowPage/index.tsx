import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isString } from 'lodash';

// components
import IdeasShow from 'containers/IdeasShow';
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// services
import { ideaBySlugStream } from 'services/ideas';

// style
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

const Container = styled.div`
  background: #fff;
`;

const IdeaNotFoundWrapper = styled.div`
  height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  font-size: ${fontSizes.large}px;
  color: ${colors.label};
`;

type Props = {
  params: {
    slug: string;
  };
};

type State = {
  ideaId: string | null;
  loading: boolean;
};

class IdeasShowPage extends React.PureComponent<Props, State> {
  slug$: Rx.BehaviorSubject<string | null>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      ideaId: null,
      loading: true,
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
          if (idea && idea.data) {
            this.setState({ ideaId: idea.data.id, loading: false });
          } else {
            // No idea has been found
            this.setState({ loading: false });
          }
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
    const { ideaId, loading } = this.state;

    if (!loading && !ideaId) {
      return (
        <IdeaNotFoundWrapper>
          <p><FormattedMessage {...messages.noIdeaFoundHere} /></p>
          <Button
            linkTo="/ideas"
            text={<FormattedMessage {...messages.goBackToList} />}
            icon="arrow-back"
          />
        </IdeaNotFoundWrapper>
      );
    }

    return (
      <Container>
        <IdeasShow ideaId={ideaId} />
      </Container>
    );
  }
}

export default IdeasShowPage;
