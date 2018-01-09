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
  max-width: 1100px;
  min-height: 200px;
  margin-top: 60px;
  margin-bottom: 60px;
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
  currentTenantLocales: string[] | null;
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
      locale: null,
      currentTenantLocales: null,
      project: null,
      selectedPhase: undefined,
      loaded: false
    };
    this.subscriptions = [];
    this.selectedPhaseId$ = new Rx.BehaviorSubject(null);
  }

  componentWillMount() {
    const locale$ = localeStream().observable;
    const currentTenantLocales$ = currentTenantStream().observable.map(currentTenant => currentTenant.data.attributes.settings.core.locales);
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
        locale$,
        currentTenantLocales$,
        project$,
        selectedPhase$
      ).subscribe(([locale, currentTenantLocales, project, selectedPhase]) => {
        this.setState({ locale, currentTenantLocales, project, selectedPhase, loaded: true });
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
    const { locale, currentTenantLocales, project, selectedPhase, loaded } = this.state;

    if (loaded && locale && currentTenantLocales && project) {
      return (
        <Container className={className}>
          <Timeline projectId={project.data.id} phaseClick={this.handleOnPhaseClick} />

          <ContentContainer>
            <Content>
              {selectedPhase &&
                <IdeaCards filter={{ phase: selectedPhase.id }} />
              }
            </Content>
          </ContentContainer>
        </Container>
      );
    }

    return null;
  }
}
