import React from 'react';
import { Subscription, BehaviorSubject } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { IStream } from 'utils/streams';

// TODO: add generic types to component when typescript 2.9 is released
type IResource = { data: IResourceData };
type IResourceData = any;

interface InputProps {
  id: string;
}

interface Props extends InputProps {
  stream: (resourceId: string) => IStream<IResource>;
  children: (renderProps: GetResourceChildProps) => JSX.Element | null ;
}

interface State {
  resource: IResourceData | null;
}

export type GetResourceChildProps = State;

export default class GetResource extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      resource: null
    };
  }

  componentDidMount() {
    this.inputProps$ = new BehaviorSubject({ id: this.props.id });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .switchMap(({ id }) => this.props.stream(id).observable)
        .subscribe((response) => this.setState({ resource: response.data }))
    ];
  }

  componentDidUpdate() {
    const { id } = this.props;
    this.inputProps$.next({ id });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
  
  render() {
    const { children } = this.props;
    const { resource } = this.state;
    return children({ resource });
  }
}
