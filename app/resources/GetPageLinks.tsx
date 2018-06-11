import React from 'react';
import get from 'lodash/get';
import isArray from 'lodash/isArray';
import isEmpty from 'lodash/isEmpty';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Subscription } from 'rxjs/Subscription';
import { of } from 'rxjs/observable/of';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { pageByIdStream } from 'services/pages';
import { getPageLink, PageLink } from 'services/pageLink';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  pageId: string | null;
}

type children = (renderProps: GetPageLinksChildProps) => JSX.Element | null;

interface Props extends InputProps {
  children?: children;
}

interface State {
  pageLinks: (PageLink | Error)[] | undefined | null | Error;
}

export type GetPageLinksChildProps = (PageLink | Error)[] | undefined | null | Error;

export default class GetPage extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      pageLinks: undefined
    };
  }

  componentDidMount() {
    const { pageId } = this.props;

    this.inputProps$ = new BehaviorSubject({ pageId });

    this.subscriptions = [
      this.inputProps$.pipe(
        distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
        switchMap(({ pageId }) => pageId ? pageByIdStream(pageId).observable : of(null)),
        switchMap((page) => {
          if (!isNilOrError(page)) {
            const pageLinks = get(page.data.relationships.page_links, 'data');

            if (isArray(pageLinks) && !isEmpty(pageLinks)) {
              return combineLatest(
                pageLinks.map(link => getPageLink(link.id).observable)
              );
            }

            return of([]);
          }

          return of(page);
        })
      ).subscribe((pageLinks) => {
        this.setState({ pageLinks: pageLinks && pageLinks.map(pageLink => !isNilOrError(pageLink) ? pageLink.data : pageLink) });
      })
    ];
  }

  componentDidUpdate() {
    const { pageId } = this.props;
    this.inputProps$.next({ pageId });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { pageLinks } = this.state;
    return (children as children)(pageLinks);
  }
}
