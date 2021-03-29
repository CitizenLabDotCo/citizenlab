import React from 'react';
import { isString } from 'lodash-es';
import { Subscription, BehaviorSubject, of } from 'rxjs';
import { distinctUntilChanged, tap, switchMap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { IPageData, pageByIdStream, pageBySlugStream } from 'services/pages';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  id?: string;
  slug?: string;
  resetOnChange?: boolean;
}

export type GetPageChildProps = IPageData | undefined | null | Error;

type children = (renderProps: GetPageChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  page: GetPageChildProps;
}

export default class GetPage extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  static defaultProps = {
    resetOnChange: true,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      page: undefined,
    };
  }

  componentDidMount() {
    const { id, slug, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ id, slug, resetOnChange });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          tap(() => resetOnChange && this.setState({ page: undefined })),
          switchMap(({ id, slug }) => {
            if (isString(id)) {
              return pageByIdStream(id).observable;
            } else if (isString(slug)) {
              return pageBySlugStream(slug).observable;
            }

            return of(null);
          })
        )
        .subscribe((page) => {
          this.setState({ page: !isNilOrError(page) ? page.data : page });
        }),
    ];
  }

  componentDidUpdate() {
    const { id, slug, resetOnChange } = this.props;
    this.inputProps$.next({ id, slug, resetOnChange });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { page } = this.state;
    return (children as children)(page);
  }
}
