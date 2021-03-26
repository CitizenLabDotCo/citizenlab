import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import shallowCompare from 'utils/shallowCompare';
import { IGeotaggedIdeaData, geotaggedIdeasStream } from 'services/ideas';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  phaseId?: string;
  projectIds?: string[];
  pageNumber?: number;
  pageSize?: number;
}

type children = (
  renderProps: GetGeotaggedIdeasChildProps
) => JSX.Element | null;

interface Props extends InputProps {
  children: children;
}

interface State {
  geotaggedIdeas: GetGeotaggedIdeasChildProps;
}

export type GetGeotaggedIdeasChildProps =
  | IGeotaggedIdeaData[]
  | undefined
  | null;

export default class GetGeotaggedIdeas extends React.Component<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      geotaggedIdeas: undefined,
    };
  }

  componentDidMount() {
    const { projectIds, phaseId, pageNumber, pageSize } = this.props;

    this.inputProps$ = new BehaviorSubject({
      projectIds,
      phaseId,
      pageNumber,
      pageSize,
    });

    this.subscriptions = [
      this.inputProps$
        .pipe(
          distinctUntilChanged((prev, next) => shallowCompare(prev, next)),
          switchMap(({ projectIds, phaseId }) => {
            return geotaggedIdeasStream({
              queryParameters: {
                projects: projectIds,
                phase: phaseId,
                'page[number]': pageNumber,
                'page[size]': pageSize,
              },
            }).observable;
          })
        )
        .subscribe((geotaggedIdeas) => {
          this.setState({
            geotaggedIdeas: !isNilOrError(geotaggedIdeas)
              ? geotaggedIdeas.data
              : null,
          });
        }),
    ];
  }

  componentDidUpdate() {
    const { projectIds, phaseId, pageNumber, pageSize } = this.props;
    this.inputProps$.next({ projectIds, phaseId, pageNumber, pageSize });
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { geotaggedIdeas } = this.state;
    return (children as children)(geotaggedIdeas);
  }
}
