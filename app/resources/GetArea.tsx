import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { IAreaData, areaByIdStream } from 'services/areas';
import { isString } from 'lodash';

interface InputProps {
  id: string;
}

type children = (renderProps: GetAreaChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  area: IAreaData | null;
}

export type GetAreaChildProps = IAreaData | null;

export default class GetArea extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      area: null
    };
  }

  componentDidMount() {
    const { id } = this.props;

    this.inputProps$ = new BehaviorSubject({ id });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .filter(({ id }) => isString(id))
        .switchMap(({ id }) => areaByIdStream(id).observable)
        .subscribe((area) => this.setState({ area: area.data }))
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
    const { area } = this.state;
    return (children as children)(area);
  }
}
