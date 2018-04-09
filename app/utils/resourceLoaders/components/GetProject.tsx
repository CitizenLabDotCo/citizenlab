import React from 'react';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import shallowCompare from 'utils/shallowCompare';
import { projectByIdStream, projectBySlugStream, IProjectData, IProject } from 'services/projects';
import { projectImagesStream, IProjectImageData } from 'services/projectImages';

interface InputProps {
  id?: string;
  slug?: string;
  withImages?: boolean;
}

interface Props extends InputProps {
  children: (renderProps: GetProjectChildProps) => JSX.Element | null;
}

interface State {
  project: IProjectData | null;
  images: IProjectImageData[] | null;
}

export type GetProjectChildProps = State;

export default class GetProject extends React.PureComponent<Props, State> {
  private inputProps$: BehaviorSubject<InputProps>;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      project: null,
      images: null,
    };
  }

  componentDidMount() {
    const { id, slug, withImages } = this.props;

    this.inputProps$ = new BehaviorSubject({ id, slug, withImages });

    this.subscriptions = [
      this.inputProps$
        .distinctUntilChanged((prev, next) => shallowCompare(prev, next))
        .switchMap(({ id, slug, withImages }) => {
          let project$: Observable<IProject | null> = Observable.of(null);

          if (id) {
            project$ = projectByIdStream(id).observable;
          } else if (slug) {
            project$ = projectBySlugStream(slug).observable;
          }

          return project$.map(project => ({ withImages, project }));
        }).switchMap(({ withImages, project }) => {
          if (withImages && project && project.data) {
            return projectImagesStream(project.data.id).observable.map(images => ({ project, images }));
          }

          return Observable.of({ project, images: null });
        }).subscribe(({ project, images }) => {
          this.setState({
            project: (project ? project.data : null),
            images: (images ? images.data : null)
          });
        })
    ];
  }

  componentDidUpdate() {
    const { id, slug, withImages } = this.props;
    this.inputProps$.next({ id, slug, withImages });
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { children } = this.props;
    const { project, images } = this.state;
    return children({ project, images });
  }
}
