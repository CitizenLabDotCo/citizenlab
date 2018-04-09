import React from 'react';
import { BehaviorSubject, Subscription } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { IIdeaData, ideasMarkersStream } from 'services/ideas';

interface InputProps {
  phaseId?: string;
  projectId?: string;
}

interface Props extends InputProps {
  children: (renderProps: GetIdeaMarkersChildProps) => JSX.Element | null ;
}

interface State {
  ideaMarkers: Partial<IIdeaData>[] | null;
}

export type GetIdeaMarkersChildProps = State;

export default class GetIdeaMarkers extends React.PureComponent<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      ideaMarkers: null,
    };
  }

  componentDidMount() {
    const { projectId, phaseId } = this.props;

    this.inputProps$ = new BehaviorSubject({ projectId, phaseId });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .switchMap(({ projectId, phaseId }) => {
          return ideasMarkersStream({
            queryParameters: {
              project: projectId,
              phase: phaseId
            },
            cacheStream: false,
          }).observable;
        }).subscribe((ideaMarkers) => {
          this.setState({
            ideaMarkers: (ideaMarkers ? ideaMarkers.data : null),
          });
        })
    ];
  }

  componentDidUpdate() {
    const { projectId, phaseId } = this.props;
    this.inputProps$.next({ projectId, phaseId });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { ideaMarkers } = this.state;
    return children({ ideaMarkers });
  }
}
