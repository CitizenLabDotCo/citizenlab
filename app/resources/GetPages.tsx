import React from 'react';
import isEqual from 'lodash/isEqual';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { of } from 'rxjs/observable/of';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { IPageData, listPages, pageByIdStream } from 'services/pages';

interface InputProps {
  ids?: string[];
}

type children = (renderProps: GetPagesChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  pages: IPageData[] | undefined | null | Error;
}

export type GetPagesChildProps = IPageData[] |undefined |  null | Error;

export default class GetPages extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      pages: undefined
    };
  }

  componentDidMount() {
    const { ids } = this.props;

    this.inputProps$ = new BehaviorSubject({ ids });

    this.subscriptions = [
      this.inputProps$.pipe(
        distinctUntilChanged((prev, next) => isEqual(prev, next)),
        switchMap(({ ids }) => {
          if (ids) {
            if (ids.length > 0) {
              return combineLatest(
                ids.map(id => pageByIdStream(id).observable.map(topic => topic.data))
              );
            }

            return of(null);
          }

          return listPages().observable.map(pages => pages.data);
        })
      )
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
