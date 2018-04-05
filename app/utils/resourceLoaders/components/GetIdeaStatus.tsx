// Libs
import React from 'react';
import { Subscription } from 'rxjs';

// Services & utils
import { IIdeaStatusData, ideaStatusStream, IIdeaStatus } from 'services/ideaStatuses';

// Typing
interface Props {
  id: string;
  children: (state: GetIdeaStatusChildProps) => JSX.Element | null;
}

interface State {
  ideaStatus: IIdeaStatusData | null;
}

export type GetIdeaStatusChildProps = State;


export default class GetIdeaStatus extends React.PureComponent<Props, State> {
  private ideaStatusSub: Subscription;

  constructor(props: Props) {
    super(props);

    this.state = {
      ideaStatus: null
    };
  }

  componentDidMount() {
    this.updateSub(this.props);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.id !== prevProps.id) {
      this.updateSub(this.props);
    }
  }

  componentWillUnmount() {
    this.ideaStatusSub.unsubscribe();
  }

  updateSub(props: Props) {
    if (this.ideaStatusSub) this.ideaStatusSub.unsubscribe();

    this.ideaStatusSub = ideaStatusStream(props.id).observable
      .subscribe((response: IIdeaStatus) => {
        this.setState({
          ideaStatus: response.data
        });
      });
  }

  render() {
    return this.props.children(this.state as GetIdeaStatusChildProps);
  }
}
