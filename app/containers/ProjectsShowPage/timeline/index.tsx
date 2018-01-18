import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import 'moment-timezone';

// components
import Timeline from './Timeline';
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';

// services
import { projectBySlugStream, IProject } from 'services/projects';
import { phasesStream, IPhaseData } from 'services/phases';

// style
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  margin-top: -65px;
  padding-left: 30px;
  padding-right: 30px;
`;

const Content = styled.div`
  width: 100%;
  max-width: 1100px;
  min-height: 200px;
  margin-top: 60px;
  margin-bottom: 60px;
`;

type Props = {
  params: {
    slug: string;
  };
};

type State = {
  project: IProject | null;
  selectedPhase: IPhaseData | undefined;
  loaded: boolean;
};

export default class timeline extends React.PureComponent<Props, State> {
  selectedPhaseId$: Rx.BehaviorSubject<string | null>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      project: null,
      selectedPhase: undefined,
      loaded: false
    };
    this.subscriptions = [];
    this.selectedPhaseId$ = new Rx.BehaviorSubject(null);
  }

  componentWillMount() {
    const project$ = projectBySlugStream(this.props.params.slug).observable;
    const phases$ = project$.switchMap(project => phasesStream(project.data.id).observable);
    const selectedPhase$ = Rx.Observable.combineLatest(
      phases$,
      this.selectedPhaseId$
    ).map(([phases, selectedPhaseId]) => {
      const selectedPhase = (phases ? phases.data.find(phase => phase.id === selectedPhaseId) : undefined);
      return selectedPhase;
    });

    this.subscriptions = [
      Rx.Observable.combineLatest(
        project$,
        selectedPhase$
      ).subscribe(([project, selectedPhase]) => {
        this.setState({ project, selectedPhase, loaded: true });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleOnPhaseClick = (phaseId: string) => {
    this.selectedPhaseId$.next(phaseId);
  }

  render() {
    const className = this.props['className'];
    const { project, selectedPhase, loaded } = this.state;

    if (loaded && project) {
      return (
        <Container className={className}>
          <Timeline projectId={project.data.id} phaseClick={this.handleOnPhaseClick} />

          <ContentContainer>
            <Content>
              {selectedPhase &&
                <IdeaCards filter={{ phase: selectedPhase.id, project: project.data.id }} />
              }
            </Content>
          </ContentContainer>
        </Container>
      );
    }

    return null;
  }
}
