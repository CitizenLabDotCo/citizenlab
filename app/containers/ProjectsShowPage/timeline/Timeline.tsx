import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import * as moment from 'moment';
import 'moment-timezone';

// components
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';
import ContentContainer from 'components/ContentContainer';
import MobileTimeline from './MobileTimeline';
import { Responsive } from 'semantic-ui-react';

// services
import { localeStream, updateLocale } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { phasesStream, IPhases, IPhaseData, IPhase } from 'services/phases';

// i18n
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { getLocalized } from 'utils/i18n';

// style
import styled, { css } from 'styled-components';
import { transparentize, lighten, darken } from 'polished';
import { media } from 'utils/styleUtils';

const MobileTLContainer = styled.div`
  width: 100%;
  display: flex;
  padding: 30px;
  align-items: center;
  justify-content: center;
`;

const Container = styled.div`
  width: 100%;
  max-width: 1080px;
  height: 250px;
  margin-left: auto;
  margin-right: auto;
  background: #fff;
  border-radius: 5px;
  border: solid #eaeaea 1px;
  overflow: hidden;
`;

const Header = styled.div`
  width: 100%;
  background: #fafafa;
  border-bottom: solid 1px #eaeaea;
  padding: 12px 18px;
  display: flex;
  justify-content: space-between;
`;

const HeaderSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const PhaseNumberWrapper = styled.div`
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border-radius: 50%;
  border: solid 2px #32B67A;
`;

const PhaseNumber = styled.div`
  color: #32B67A;
  font-size: 16px;
  line-height: 16px;
  font-weight: 400;
  margin: 0;
  padding: 0;
`;

const HeaderTitle = styled.div`
  color: #222;
  font-size: 21px;
  line-height: 25px;
  font-weight: 400;
`;

const Phases = styled.div`
  width: 100%;
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
  transition: all 80ms ease-out;
  user-select: none;

  &:hover {
    background: ${(props) => props.theme.colors.label};
  }

  ${(props: any) => props.first && css`
    border-radius: 5px 0px 0px 5px;
  `}

  ${(props: any) => props.last && css`
    border-radius: 0px 5px 5px 0px;
  `}

  ${(props: any) => props.current && css`
    background: #98dabc;

    &:hover {
      background: #32B67A;
    }
  `}

  ${(props: any) => props.selected && css`
    background: ${(props) => props.theme.colors.label};
  `}

  ${(props: any) => props.selected && props.current && css`
    background: #32B67A;
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

  ${(props: any) => props.current && css`
    color: #98dabc;
  `}

  ${(props: any) => props.selected && css`
    color: ${(props) => props.theme.colors.label};
    color: #333;
  `}

  ${(props: any) => props.selected && props.current && css`
    color: #32B67A;
  `}
`;

type Props = {
  projectId: string
  phaseClick: (phaseId: string) => void;
};

type State = {
  locale: string | null;
  currentTenant: ITenant | null;
  phases: IPhases | null;
  currentPhaseId: string | null;
  selectedPhaseId: string | null;
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
      currentPhaseId: null,
      selectedPhaseId: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { projectId } = this.props;
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const phases$ = phasesStream(projectId).observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$,
        phases$
      ).subscribe(([locale, currentTenant, phases]) => {
        this.setState((state: State) => {
          let currentPhaseId = state.currentPhaseId;
          let selectedPhaseId = state.selectedPhaseId;

          if (phases && phases.data.length > 0) {
            phases.data.forEach((phase) => {
              const currentTenantTimezone = currentTenant.data.attributes.settings.core.timezone;
              const currentTenantTodayMoment = moment().tz(currentTenantTimezone);
              const startIsoDate = phase.attributes.start_at;
              const endIsoDate = phase.attributes.end_at;
              const startMoment = moment(startIsoDate, 'YYYY-MM-DD');
              const endMoment = moment(endIsoDate, 'YYYY-MM-DD');
              const isCurrentPhase = currentTenantTodayMoment.isBetween(startMoment, endMoment, 'days', '[]');
              currentPhaseId = (isCurrentPhase && state.currentPhaseId !== phase.id ? phase.id : currentPhaseId);

              if (isCurrentPhase && !state.selectedPhaseId) {
                selectedPhaseId = phase.id;
                this.props.phaseClick(selectedPhaseId);
              }
            });
          }

          return {
            locale,
            currentTenant,
            phases,
            currentPhaseId,
            selectedPhaseId
          };
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handlePhaseOnClick = (phaseId: string) => (event: React.FormEvent<MouseEvent>) => {
    event.preventDefault();
    this.handlePhaseChange(phaseId);
  }

  handlePhaseChange = (phaseId) => {
    if (phaseId !== this.state.selectedPhaseId) {
      this.props.phaseClick(phaseId);
      this.setState({ selectedPhaseId: phaseId });
    }
  }

  handleOnAddIdeaClick = () => {
    // empty
  }

  render() {
    const className = this.props['className'];
    const { locale, currentTenant, phases, currentPhaseId, selectedPhaseId } = this.state;

    if (locale && currentTenant && phases && phases.data.length > 0) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
      const currentTenantTimezone = currentTenant.data.attributes.settings.core.timezone;
      const currentTenantTodayMoment = moment().tz(currentTenantTimezone);

      return (
        <Container className={className}>
          <Header>
            <HeaderSection>
              <PhaseNumberWrapper>
                <PhaseNumber>3</PhaseNumber>
              </PhaseNumberWrapper>

              <HeaderTitle>
                Kies uit 20 acties
              </HeaderTitle>
            </HeaderSection>

            <HeaderSection>
              <Button
                onClick={this.handleOnAddIdeaClick}
                style="primary"
                size="2"
                text={<FormattedMessage {...messages.startAnIdea} />}
                circularCorners={false}
              />
            </HeaderSection>
          </Header>
          <ContentContainer>

            <Responsive maxWidth={481} as={MobileTLContainer} >
              <MobileTimeline
                phases={phases.data}
                currentPhase={currentPhaseId}
                selectedPhase={selectedPhaseId}
                onPhaseSelection={this.handlePhaseChange}
              />
            </Responsive>

            <Responsive minWidth={481}>
              <Phases>
                {phases.data.map((phase, index) => {
                  const phaseTitle = getLocalized(phase.attributes.title_multiloc, locale, currentTenantLocales);
                  const isFirst = (index === 0);
                  const isLast = (index === phases.data.length - 1);
                  const startIsoDate = phase.attributes.start_at;
                  const endIsoDate = phase.attributes.end_at;
                  const startMoment = moment(startIsoDate, 'YYYY-MM-DD');
                  const endMoment = moment(endIsoDate, 'YYYY-MM-DD');
                  const isCurrentPhase = (phase.id === currentPhaseId);
                  const isSelectedPhase = (phase.id === selectedPhaseId);
                  const numberOfDays = Math.abs(startMoment.diff(endMoment, 'days')) + 1;

                  return (
                    <PhaseContainer key={index} numberOfDays={numberOfDays}>
                      <PhaseBar
                        first={isFirst}
                        last={isLast}
                        current={isCurrentPhase}
                        selected={isSelectedPhase}
                        onClick={this.handlePhaseOnClick(phase.id)}
                      >
                        {index + 1}
                        {!isLast && <PhaseArrow name="phase_arrow" />}
                      </PhaseBar>
                      <PhaseText
                        current={isCurrentPhase}
                        selected={isSelectedPhase}
                      >
                        {phaseTitle}
                      </PhaseText>
                    </PhaseContainer>
                  );
                })}
              </Phases>
            </Responsive>
          </ContentContainer>
        </Container>
      );
    }

    return null;
  }
}
