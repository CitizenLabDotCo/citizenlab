import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { IPageData, pageByIdStream } from 'services/pages';

interface InputProps {
  id: string;
}

type children = (renderProps: GetPageChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  page: IPageData | null;
}

export type GetPageChildProps = IPageData | null;

export default class GetPage extends React.PureComponent<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      page: null
    };
  }

  componentDidMount() {
    const { id } = this.props;

    this.inputProps$ = new BehaviorSubject({ id });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .switchMap(({ id }) => pageByIdStream(id).observable)
        .subscribe((page) => this.setState({ page: page.data }))
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
    const { page } = this.state;
    return (children as children)(page);
  }
}
