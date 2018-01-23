// Libs
import React from 'react';
import { Subscription, Observable } from 'rxjs';

// Services & utils
import { projectByIdStream, projectBySlugStream, IProjectData, IProject } from 'services/projects';
import { projectImagesStream, IProjectImageData } from 'services/projectImages';

// Typing
interface Props {
  id?: string;
  slug?: string;
  children: {(state: Partial<State>): any};
  withImages?: boolean;
}

interface State {
  project: IProjectData | null;
  images: IProjectImageData[];
}

export default class GetProject extends React.PureComponent<Props, State> {
  private projectSub: Subscription;

  constructor(props: Props) {
    super(props);

    this.state = {
      project: null,
      images: [],
    };
  }

  componentWillMount() {
    this.updateSub(this.props);
  }

  componentWillReceiveProps(newProps) {
    if ((newProps.id !== this.props.id) || (newProps.slug !== this.props.slug)) {
      this.updateSub(newProps);
    }
  }

  componentWillUnmount() {
    this.projectSub.unsubscribe();
  }

  updateSub(props: Props) {
    if (this.projectSub) this.projectSub.unsubscribe();

    let targetStream;
    if (props.id) targetStream = projectByIdStream(props.id);
    if (props.slug) targetStream = projectBySlugStream(props.slug);

    if (!targetStream) return;

    if (!this.props.withImages) {
      this.projectSub = targetStream.observable
      .subscribe((response: IProject) => {
        this.setState({
          project: response.data
        });
      });
    } else {
      this.projectSub = targetStream.observable
      .switchMap((response: IProject) => {
        console.log(response);
        if (response && response.data) {
          return projectImagesStream(response.data.id)
          .observable.first()
          .map((imagesResponse) => {
            return { project: response.data, images: imagesResponse.data };
          });
        }

        return Observable.of({ project: null, images: null });
      })
      .subscribe(({ project, images }) => {
        console.log('subscribe');
        this.setState({ project, images });
      });
    }
  }

  render() {
    return this.props.children(this.state);
  }
}
