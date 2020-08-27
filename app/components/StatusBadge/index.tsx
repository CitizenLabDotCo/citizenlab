import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';

// services
import { ideaStatusStream, IIdeaStatus } from 'services/ideaStatuses';

// i18n
import T from 'components/T';

// style
import styled from 'styled-components';

// utils
import { fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  color: #fff;
  font-size: ${fontSizes.xs}px;
  line-height: 16px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  padding: 6px 12px;
  display: inline-block;
  text-transform: uppercase;
  text-align: center;
  font-weight: 600;
  background-color: ${(props: any) => props.color};
`;

type Props = {
  statusId: string;
  className?: string;
  id?: string;
};

type State = {
  ideaStatus: IIdeaStatus | null;
};

export default class StatusBadge extends PureComponent<Props, State> {
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      ideaStatus: null,
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const { statusId } = this.props;
    const ideaStatus$ = ideaStatusStream(statusId).observable;

    this.subscriptions = [
      ideaStatus$.subscribe((ideaStatus) => this.setState({ ideaStatus })),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { ideaStatus } = this.state;
    const { className, id } = this.props;

    if (ideaStatus !== null) {
      const color = ideaStatus ? ideaStatus.data.attributes.color : '#bbb';

      return (
        <Container id={id} className={className} color={color}>
          <T value={ideaStatus.data.attributes.title_multiloc} />
        </Container>
      );
    }

    return null;
  }
}
