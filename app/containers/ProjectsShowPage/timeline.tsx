import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import * as moment from 'moment';
import 'moment-timezone';

// components
import Icon from 'components/UI/Icon';

// services
import { localeStream, updateLocale } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { projectBySlugStream } from 'services/projects';
import { phasesStream, IPhases, IPhaseData } from 'services/phases';

// i18n
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { getLocalized } from 'utils/i18n';

// style
import styled, { css } from 'styled-components';
// import styled, { css } from 'styled-components';
import { transparentize, lighten, darken } from 'polished';
// import { media } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  height: 200px;
`;

const Phases = styled.div`
  width: 100%;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 50px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
`;

const PhaseContainer: any = styled.div`
  min-width: 80px;
  flex-shrink: 0;
  flex-grow: ${(props: any) => props.numberOfDays};
  flex-basis: auto;
  position: relative;
`;

const PhaseBar: any = styled.div`
  height: 24px;
  color: #fff;
  font-size: 14px;
  font-weight: 400;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #d0d5d9;
  transition: all 100ms ease-out;

  &:hover {
    background: ${(props) => props.theme.colors.label};
  }

  ${(props: any) => props.first && css`
    border-radius: 5px 0px 0px 5px;
  `}

  ${(props: any) => props.last && css`
    border-radius: 0px 5px 5px 0px;
  `}

  ${(props: any) => props.active && css`
    background: ${(props) => props.theme.colors.success};

    &:hover {
      background: ${(props) => darken(0.15, props.theme.colors.success)};
    }
  `}
`;

const PhaseArrow = styled(Icon)`
  height: 100%;
  fill: #fff;
  position: absolute;
  top: 0;
  right: -9px;
  z-index: 2;
`;

const PhaseText: any = styled.div`
  width: 100%;
  /* height: 100%; */
  /* height: 40px; */
  /* margin-top: 50px; */
  color: ${(props) => props.theme.colors.label};
  font-size: 14px;
  font-weight: 300;
  text-align: center;

  position: absolute;
  top: 40px;
  left: 0;
  right: 0;

  overflow-wrap: break-word;
  word-wrap: break-word;
  -ms-word-break: break-all;
  word-break: break-all;
  word-break: break-word;
  -ms-hyphens: auto;
  -moz-hyphens: auto;
  -webkit-hyphens: auto;
  hyphens: auto;
  /* white-space: nowrap; */

  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-height: 18px;
  height: 54px;

  ${(props: any) => props.active && css`
    color: ${(props) => props.theme.colors.success};
  `}
`;

type Props = {
  projectSlug: string
};

type State = {
  locale: string | null;
  currentTenant: ITenant | null;
  phases: IPhases | null;
  totalNumberOfDays: number | null;
};

export default class Timeline extends React.PureComponent<Props, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      currentTenant: null,
      phases: null,
      totalNumberOfDays: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { projectSlug } = this.props;
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const project$ = projectBySlugStream(projectSlug).observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$,
        project$
      ).switchMap(([locale, currentTenant, project]) => {
        return phasesStream(project.data.id).observable.map((phases) => ({ locale, currentTenant, project, phases }));
      }).subscribe(({ locale, currentTenant, project, phases }) => {
        let totalNumberOfDays: number | null = null;

        if (phases && phases.data.length > 0) {
          const firstPhase = _.first(phases.data) as IPhaseData;
          const lastPhase = _.last(phases.data) as IPhaseData;
          const startIsoDate = firstPhase.attributes.start_at;
          const endIsoDate = lastPhase.attributes.end_at;
          const startMoment = moment(startIsoDate, 'YYYY-MM-DD');
          const endMoment = moment(endIsoDate, 'YYYY-MM-DD');
          totalNumberOfDays = Math.abs(startMoment.diff(endMoment, 'days')) + 1;
        }

        this.setState({ locale, currentTenant, phases, totalNumberOfDays });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const className = this.props['className'];
    const { locale, currentTenant, phases, totalNumberOfDays } = this.state;

    if (locale && currentTenant && phases && phases.data.length > 0) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
      const currentTenantTimezone = currentTenant.data.attributes.settings.core.timezone;
      const currentTenantTodayMoment = moment().tz(currentTenantTimezone);

      return (
        <Container className={className}>
          <Phases>
            {phases.data.map((phase, index) => {
              const phaseTitle = getLocalized(phase.attributes.title_multiloc, locale, currentTenantLocales);
              const isFirst = (index === 0);
              const isLast = (index === phases.data.length - 1);
              const startIsoDate = phase.attributes.start_at;
              const endIsoDate = phase.attributes.end_at;
              const startMoment = moment(startIsoDate, 'YYYY-MM-DD');
              const endMoment = moment(endIsoDate, 'YYYY-MM-DD');
              const isActive = currentTenantTodayMoment.isBetween(startMoment, endMoment, 'days', '[]');
              const numberOfDays = Math.abs(startMoment.diff(endMoment, 'days')) + 1;

              return (
                <PhaseContainer key={index} numberOfDays={numberOfDays}>
                  <PhaseBar first={isFirst} last={isLast} active={isActive}>
                    {index + 1}
                    {!isLast && <PhaseArrow name="phase_arrow" />}
                  </PhaseBar>
                  <PhaseText active={isActive}>
                    {phaseTitle}
                  </PhaseText>
                </PhaseContainer>
              );
            })}
          </Phases>
        </Container>
      );
    }

    return null;
  }
}
