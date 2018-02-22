import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isString } from 'lodash';

// components
import Header from '../Header';
import ContentContainer from 'components/ContentContainer';
import ProjectInfo from './ProjectInfo';
import EventsPreview from '../EventsPreview';

// services
import { projectBySlugStream, IProject } from 'services/projects';

type Props = {
  params: {
    slug: string;
  };
};

type State = {
  project: IProject | null;
};

export default class ProjectInfoPage extends React.PureComponent<Props, State> {
  slug$: Rx.BehaviorSubject<string | null>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      project: null
    };
    this.slug$ = new Rx.BehaviorSubject(null);
    this.subscriptions = [];
  }

  componentDidMount() {
    this.slug$.next(this.props.params.slug);

    this.subscriptions = [
      this.slug$
        .distinctUntilChanged()
        .filter(slug => isString(slug))
        .switchMap((slug: string) => {
          const project$ = projectBySlugStream(slug).observable;
          return project$;
        }).subscribe((project) => {
          this.setState({ project });
        })
    ];
  }

  componentDidUpdate(_prevProps: Props) {
    this.slug$.next(this.props.params.slug);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { project } = this.state;
    const { slug } = this.props.params;

    if (project) {
      return (
        <>
          <Header slug={slug} />

          <ContentContainer>
            <ProjectInfo projectId={project.data.id} />
          </ContentContainer>

          <EventsPreview projectId={project.data.id} />
        </>
      );
    }

    return null;
  }
}
