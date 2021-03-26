import React from 'react';
import { Subscription, fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

interface InputProps {}

type children = (renderProps: GetWindowSizeChildProps) => JSX.Element | null;

interface Props extends InputProps {
  debounce?: number;
  children?: children;
}

interface State {
  size: number | undefined | null;
}

export type GetWindowSizeChildProps = number | undefined | null;

export default class GetWindowSize extends React.Component<Props, State> {
  private subscriptions: Subscription[];

  static defaultProps = {
    debounce: 50,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      size: undefined,
    };
  }

  componentDidMount() {
    this.setState({ size: window.innerWidth });

    this.subscriptions = [
      fromEvent(window, 'resize')
        .pipe(
          debounceTime(this.props.debounce as number),
          distinctUntilChanged()
        )
        .subscribe((event) => {
          if (event.target) {
            const size = event.target['innerWidth'] as number;
            this.setState({ size });
          }
        }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { size } = this.state;
    return (children as children)(size);
  }
}
