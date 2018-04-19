import React from 'react';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import { IPageData, listPages, pageByIdStream } from 'services/pages';
import { isEqual } from 'lodash';

interface InputProps {
  ids?: string[];
}

type children = (renderProps: GetPagesChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  pages: IPageData[] | null;
}

export type GetPagesChildProps = IPageData[] | null;

export default class GetPages extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      pages: null,
    };
  }

  componentDidMount() {
    const { ids } = this.props;

    this.inputProps$ = new BehaviorSubject({ ids });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => isEqual(prev, next))
        .switchMap(({ ids }) => {
          if (ids) {
            if (ids.length > 0) {
              return Observable.combineLatest(
                ids.map(id => pageByIdStream(id).observable.map(topic => topic.data))
              );
            }

            return Observable.of(null);
          }

          return listPages().observable.map(pages => pages.data);
        })
        .subscribe((pages) => {
          this.setState({ pages });
        })
    ];
  }

  componentDidUpdate() {
    this.inputProps$.next({ ids: this.props.ids });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { pages } = this.state;
    return (children as children)(pages);
  }
}
