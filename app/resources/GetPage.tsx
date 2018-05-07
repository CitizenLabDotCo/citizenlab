import React from 'react';
import { BehaviorSubject, Subscription, Observable } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { IPageData, pageByIdStream, pageBySlugStream } from 'services/pages';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  id?: string;
  slug?: string;
  resetOnChange?: boolean;
}

type children = (renderProps: GetPageChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  page: IPageData | undefined | null | Error;
}

export type GetPageChildProps = IPageData | undefined | null | Error;

export default class GetPage extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  public static defaultProps: Partial<Props> = {
    resetOnChange: true
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      page: undefined
    };
  }

  componentDidMount() {
    const { id, slug, resetOnChange } = this.props;

    this.inputProps$ = new BehaviorSubject({ id, slug, resetOnChange });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .do(() => resetOnChange && this.setState({ page: undefined }))
        .switchMap(({ id, slug }) => {
          if (id) {
            return pageByIdStream(id).observable;
          } else if (slug) {
            return pageBySlugStream(slug).observable;
          }

          return Observable.of(null);
        })
        .subscribe((page) => {
          this.setState({ page: !isNilOrError(page) ? page.data : page });
        })
      ];
  }

  componentDidUpdate() {
    const { id, slug, resetOnChange } = this.props;
    this.inputProps$.next({ id, slug, resetOnChange });
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
