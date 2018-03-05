// Libs
import React from 'react';
import { Subscription, Observable } from 'rxjs';
import { isEqual } from 'lodash';

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

  componentDidMount() {
    this.updateSub(this.props);
  }

  componentDidUpdate(prevProps: Props) {
    const { children: prevPropsChildren, ...prevPropsWithoutChildren } = prevProps;
    const { children: newPropsChildren, ...newPropsWithoutChildren } = this.props;

    if (!isEqual(newPropsWithoutChildren, prevPropsWithoutChildren)) {
      this.updateSub(this.props);
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
        this.setState({ project, images });
      });
    }
  }

  render() {
    return this.props.children(this.state);
  }
}
