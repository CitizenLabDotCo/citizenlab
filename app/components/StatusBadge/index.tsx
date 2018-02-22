import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// services
import { ideaStatusStream, IIdeaStatus } from 'services/ideaStatuses';

// i18n
import T from 'components/T';

// style
import styled from 'styled-components';

const Container = styled.div`
  color: #fff;
  font-size: 12px;
  line-height: 16px;
  border-radius: 5px;
  padding: 6px 12px;
  display: inline-block;
  text-transform: uppercase;
  text-align: center;
  font-weight: 600;
  background-color: ${(props: any) => props.color}
`;

type Props = {
  statusId: string;
};

type State = {
  ideaStatus: IIdeaStatus | null;
};

export default class StatusBadge extends React.PureComponent<Props, State> {
  
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      ideaStatus: null
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const { statusId } = this.props;
    const ideaStatus$ = ideaStatusStream(statusId).observable;

    this.subscriptions = [
      ideaStatus$.subscribe(ideaStatus => this.setState({ ideaStatus }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { ideaStatus } = this.state;

    if (ideaStatus !== null) {
      const className = this.props['className'];
      const color = (ideaStatus ? ideaStatus.data.attributes.color : '#bbb');

      return (
        <Container className={className} color={color} >
          <T value={ideaStatus.data.attributes.title_multiloc} />
        </Container>
      );
    }

    return null;
  }
}
