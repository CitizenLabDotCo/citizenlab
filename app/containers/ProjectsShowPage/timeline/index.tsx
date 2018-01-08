import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import * as moment from 'moment';
import 'moment-timezone';

// components
import Timeline from './Timeline';
import ContentContainer from 'components/ContentContainer';
import IdeaCards from 'components/IdeaCards';

// services
import { localeStream, updateLocale } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { projectBySlugStream, IProject } from 'services/projects';
import { phasesStream, IPhases, IPhaseData } from 'services/phases';

// i18n
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { getLocalized } from 'utils/i18n';

// style
import styled, { css } from 'styled-components';
import { transparentize, lighten, darken } from 'polished';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  margin-top: -65px;
  padding-left: 30px;
  padding-right: 30px;
`;

const Content = styled.div`
  width: 100%;
  min-height: 200px;
  margin-top: 40px;
  margin-bottom: 40px;
`;

const SelectedPhase = styled.div`
  color: #333;
  font-size: 34px;
  line-height: 40px;
  font-weight: 400;
  margin-bottom: 40px;
`;

type Props = {
  params: {
    slug: string;
  };
};

type State = {
  locale: string | null;
  currentTenant: ITenant | null;
  project: IProject | null;
  phases: IPhases | null;
  selectedPhase: IPhaseData | undefined;
};

export default class timeline extends React.PureComponent<Props, State> {
  state: State;
  selectedPhaseId$: Rx.BehaviorSubject<string | null>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      currentTenant: null,
      project: null,
      phases: null,
      selectedPhase: undefined
    };
    this.subscriptions = [];
    this.selectedPhaseId$ = new Rx.BehaviorSubject(null);
  }

  componentWillMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const project$ = projectBySlugStream(this.props.params.slug).observable;
    const phases$ = project$.switchMap(project => phasesStream(project.data.id).observable);

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$,
        project$,
        phases$,
        this.selectedPhaseId$
      ).subscribe(([locale, currentTenant, project, phases, selectedPhaseId]) => {
        const selectedPhase = (phases ? phases.data.find(phase => phase.id === selectedPhaseId) : undefined);
        this.setState({ locale, currentTenant, project, phases, selectedPhase });
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
    const { slug } = this.props.params;
    const { locale, currentTenant, project, selectedPhase } = this.state;

    if (locale && currentTenant && project) {
      return (
        <Container className={className}>
          <Timeline projectId={project.data.id} phaseClick={this.handleOnPhaseClick} />

          <ContentContainer>
            <Content>
              {selectedPhase && 
                <>
                  <SelectedPhase>
                    {selectedPhase.attributes.title_multiloc[locale]}
                  </SelectedPhase>

                  <IdeaCards filter={{ phase: selectedPhase.id }} />
                </>
              }

              {!selectedPhase && <FormattedMessage {...messages.noPhaseSelected} />}
            </Content>
          </ContentContainer>
        </Container>
      );
    }

    return null;
  }
}
