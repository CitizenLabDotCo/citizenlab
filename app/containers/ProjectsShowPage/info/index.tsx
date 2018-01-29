import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isString } from 'lodash';

// components
import ContentContainer from 'components/ContentContainer';
import ProjectInfo from './ProjectInfo';
import EventsPreview from '../EventsPreview';

// services
import { projectBySlugStream, IProject } from 'services/projects';

// style
import styled from 'styled-components';

type Props = {
  params: {
    slug: string;
  };
};

type State = {
  project: IProject | null;
};

const Container = styled.div``;

export default class ProjectInfoPage extends React.PureComponent<Props, State> {
  slug$: Rx.BehaviorSubject<string>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      project: null
    };
    this.slug$ = new Rx.BehaviorSubject(null as any);
    this.subscriptions = [];
  }

  componentWillMount() {
    this.slug$.next(this.props.params.slug);

    this.subscriptions = [
      this.slug$.distinctUntilChanged().filter(slug => isString(slug)).switchMap((slug) => {
        const project$ = projectBySlugStream(slug).observable;
        return project$;
      }).subscribe((project) => {
        this.setState({ project });
      })
    ];
  }

  componentWillReceiveProps(newProps: Props) {
    this.slug$.next(newProps.params.slug);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { project } = this.state;

    if (project) {
      return (
        <Container>
          <ContentContainer>
            <ProjectInfo projectId={project.data.id} />
          </ContentContainer>
          <EventsPreview projectId={project.data.id} />
        </Container>
      );
    }

    return null;
  }
}
