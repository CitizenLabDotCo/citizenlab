import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isString } from 'lodash';
import { browserHistory } from 'react-router';

// components
import Ideas from './Ideas';
import EventsPreview from '../EventsPreview';
import ContentContainer from 'components/ContentContainer';

// services
import { projectBySlugStream, IProject } from 'services/projects';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// style
import styled from 'styled-components';

const Container = styled.div`
  padding-top: 70px;
  padding-bottom: 70px;
`;

const IdeasTitle = styled.h1`
  color: #333;
  font-size: 29px;
  line-height: 35px;
  font-weight: 600;
  margin-top: 40px;
  margin-bottom: 30px;
`;

type Props = {
  params: {
    slug: string;
  };
};

type State = {
  project: IProject | null;
};

export default class ProjectIdeasPage extends React.PureComponent<Props, State> {
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
        const project$ = projectBySlugStream(slug).observable.do((project) => {
          if (project.data.attributes.process_type !== 'continuous') {
            browserHistory.push(`/projects/${slug}`);
          }
        });

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
            <IdeasTitle>
              <FormattedMessage {...messages.ideasTitle} />
            </IdeasTitle>
            <Ideas type="project" id={project.data.id} />
          </ContentContainer>
          <EventsPreview projectId={project.data.id} />
        </Container>
      );
    }

    return null;
  }
}
