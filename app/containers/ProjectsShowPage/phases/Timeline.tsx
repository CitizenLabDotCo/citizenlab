import * as React from 'react';
import { cloneDeep, indexOf, isString } from 'lodash';
import * as Rx from 'rxjs/Rx';
import * as moment from 'moment';
import 'moment-timezone';

// components
import Icon from 'components/UI/Icon';
import IdeaButton from './IdeaButton';
import MobileTimeline from './MobileTimeline';
import { Responsive } from 'semantic-ui-react';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { phasesStream, IPhases } from 'services/phases';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { getLocalized } from 'utils/i18n';

// style
import styled, { css } from 'styled-components';
import { media } from 'utils/styleUtils';

// typings
import { Locale } from 'typings';

const greyTransparent = css`rgba(121, 137, 147, 1)`;
const greyOpaque = css`rgba(121, 137, 147, 1)`;
const greenTransparent = css`rgba(29, 170, 99, 0.5)`;
const greenOpaque = css`rgba(29, 170, 99, 1)`;

const Container = styled.div`
  width: 100%;
  max-width: 1100px;
  margin-left: auto;
  margin-right: auto;
  margin-top: -61px;

  * {
    user-select: none;
  }
`;

const Header = styled.div`
  width: 100%;
  min-height: 60px;
  padding: 10px 28px;
  display: flex;
  justify-content: space-between;
  border: solid 1px #e4e4e4;
  border-bottom: none;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  background: #fafafa;
`;

const HeaderSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const HeaderLeftSection = HeaderSection.extend``;

const HeaderRightSection = HeaderSection.extend`
  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const PhaseNumberWrapper = styled.div`
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border-radius: 50%;
  border: solid 1px ${greyTransparent};

  &.selected {
    border-color: ${greyOpaque};
  }

  &.selected.current {
    border-color: ${greenOpaque};
    background: ${greenOpaque};
  }
`;

const PhaseNumber = styled.div`
  color: ${greyTransparent};
  font-size: 16px;
  line-height: 16px;
  font-weight: 400;
  margin: 0;
  padding: 0;

  &.selected {
    color: ${greyOpaque};
  }

  &.selected.current {
    color: #fff;
  }
`;

const HeaderTitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 15px;
`;

const HeaderTitle = styled.div`
  color: ${greyTransparent};
  font-size: 21px;
  line-height: 25px;
  font-weight: 400;
  margin-right: 20px;

  &.selected {
    color: ${greyOpaque};
  }

  &.selected.current {
    color: #222;
  }

  ${media.smallerThanMaxTablet`
    font-size: 20px;
    line-height: 24px;
  `}
`;

const MobileDate = styled.div`
  color: #999;
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  margin-top: 4px;
  display: none;

  ${media.smallerThanMaxTablet`
    display: block;
  `}
`;

const HeaderSubtitle = styled.div`
  color: #999;
  font-size: 15px;
  line-height: 20px;
  font-weight: 300;
  margin-top: 3px;
`;

const HeaderDate = styled.div`
  color: #000;
  font-size: 14px;
  font-weight: 400;
  line-height: 16px;
  white-space: nowrap;
  margin-right: 20px;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const MobileTimelineContainer = styled.div`
  width: 100%;
  display: flex;
  padding: 30px;
  align-items: center;
  justify-content: center;
  border: solid 1px #e4e4e4;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  background: #fff;
`;

const Phases = styled.div`
  width: 100%;
  padding: 0px 30px;
  margin-left: auto;
  margin-right: auto;
  padding-top: 50px;
  padding-bottom: 40px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  border: solid 1px #e4e4e4;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
  background: #fff;
`;

const phaseBarHeight = '25px';

const PhaseBar: any = styled.div`
  width: 100%;
  height: calc( ${phaseBarHeight} - 1px );
  color: #fff;
  font-size: 14px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #d0d5d9;
  transition: background 60ms ease-out;
  user-select: none;
`;

const PhaseArrow = styled(Icon)`
  height: ${phaseBarHeight};
  fill: #fff;
  position: absolute;
  top: 0px;
  right: -9px;
  z-index: 2;
`;

const PhaseText: any = styled.div`
  color: #d0d5d9;
  font-size: 15px;
  font-weight: 400;
  text-align: center;
  overflow-wrap: break-word;
  word-wrap: break-word;
  -ms-word-break: break-all;
  word-break: break-all;
  word-break: break-word;
  -ms-hyphens: auto;
  -moz-hyphens: auto;
  -webkit-hyphens: auto;
  hyphens: auto;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-height: 19px;
  max-height: 54px;
  margin-top: 12px;
  padding-left: 5px;
  padding-right: 5px;
  user-select: none;
  transition: color 60ms ease-out;
`;

const selectedPhaseBar = css`
  ${PhaseBar} { background: ${greyOpaque}; }
  ${PhaseText} { color: ${greyOpaque}; }
`;
const currentPhaseBar = css`
  ${PhaseBar} { background: ${greenTransparent}; }
  ${PhaseText} { color: ${greenTransparent}; }
`;
const currentSelectedPhaseBar = css`
  ${PhaseBar} { background: ${greenOpaque}; }
  ${PhaseText} { color: ${greenOpaque}; }
`;

const PhaseContainer: any = styled.div`
  min-width: 80px;
  flex-shrink: 1;
  flex-grow: ${(props: any) => props.numberOfDays};
  flex-basis: auto;
  display: flex;
  flex-direction: column;
  position: relative;
  cursor: pointer;
  margin-right:  ${(props: any) => !props.last ? '1px' : '0px' };

  &.first ${PhaseBar} {
    border-radius: 5px 0px 0px 5px;
  }

  &.last ${PhaseBar} {
    border-radius: 0px 5px 5px 0px;
  }

  &:hover {
    ${selectedPhaseBar}
  }

  &.current:not(.selected) {
    ${currentPhaseBar}

    &:hover {
      ${currentSelectedPhaseBar}
    }
  }

  &.selected:not(.current) {
    ${selectedPhaseBar}
  }

  &.selected.current {
    ${currentSelectedPhaseBar}
  }
`;

type Props = {
  projectId: string
  onPhaseClick: (phaseId: string | null) => void;
};

type State = {
  locale: Locale | null;
  currentTenant: ITenant | null;
  phases: IPhases | null;
  currentPhaseId: string | null;
  selectedPhaseId: string | null;
};

export default class Timeline extends React.PureComponent<Props, State> {
  projectId$: Rx.BehaviorSubject<string>;
  selectedPhaseId$: Rx.BehaviorSubject<string | null>;
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
    this.projectId$ = new Rx.BehaviorSubject(null as any);
    this.selectedPhaseId$ = new Rx.BehaviorSubject(null);
  }

  componentWillMount() {
    this.projectId$.next(this.props.projectId);

    this.subscriptions = [
      this.projectId$.distinctUntilChanged().filter(projectId => isString(projectId)).switchMap((projectId) => {
        const locale$ = localeStream().observable;
        const currentTenant$ = currentTenantStream().observable;
        const phases$ = phasesStream(projectId).observable;

        return Rx.Observable.combineLatest(
          locale$,
          currentTenant$,
          phases$,
          this.selectedPhaseId$.distinctUntilChanged()
        );
      }).subscribe(([locale, currentTenant, phases, selectedPhaseId]) => {
        this.setState((state: State) => {
          let currentPhaseId = cloneDeep(state.currentPhaseId);

          if (phases && phases.data.length > 0) {
            const currentTenantTimezone = currentTenant.data.attributes.settings.core.timezone;
            const currentTenantTodayMoment = moment().tz(currentTenantTimezone);

            phases.data.forEach((phase) => {
              const startMoment = moment(phase.attributes.start_at, 'YYYY-MM-DD');
              const endMoment = moment(phase.attributes.end_at, 'YYYY-MM-DD');
              const isCurrentPhase = currentTenantTodayMoment.isBetween(startMoment, endMoment, 'days', '[]');

              if (isCurrentPhase) {
                if (!currentPhaseId || (currentPhaseId && phase.id !== currentPhaseId)) {
                  currentPhaseId = phase.id;
                }

                return false;
              }

              return true;
            });
          }

          if (selectedPhaseId !== state.selectedPhaseId) {
            this.props.onPhaseClick(selectedPhaseId);
          }

          return {
            locale,
            currentTenant,
            phases,
            selectedPhaseId,
            currentPhaseId
          };
        });
      })
    ];
  }

  componentDidMount() {
    if (this.state.currentPhaseId && !this.state.selectedPhaseId) {
      this.selectedPhaseId$.next(this.state.currentPhaseId);
    }
  }

  componentWillReceiveProps(newProps: Props) {
    this.projectId$.next(newProps.projectId);
  }

  componentWillUpdate(_nextProps: Props, nextState: State) {
    if (nextState.currentPhaseId && !nextState.selectedPhaseId) {
      this.selectedPhaseId$.next(nextState.currentPhaseId);
    }
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handlePhaseOnClick = (phaseId: string) => (event: React.FormEvent<MouseEvent>) => {
    event.preventDefault();
    this.selectedPhaseId$.next(phaseId);
  }

  goToPrevPhase = (firstPhaseSelected: boolean) => (event: React.FormEvent<any>) => {
    event.preventDefault();

    if (!firstPhaseSelected) {
      const { phases, selectedPhaseId } = this.state;
      const phaseIds = phases ? phases.data.map(phase => phase.id) : null;

      if (phaseIds && phaseIds.length > 1) {
        const index = indexOf(phaseIds, selectedPhaseId);
        const newIndex = (index > 0 ? index - 1 : phaseIds.length - 1);
        this.selectedPhaseId$.next(phaseIds[newIndex]);
      }
    }
  }

  goToNextPhase = (lastPhaseSelected: boolean) => (event: React.FormEvent<any>) => {
    event.preventDefault();

    if (!lastPhaseSelected) {
      const { phases, selectedPhaseId } = this.state;
      const phaseIds = phases ? phases.data.map(phase => phase.id) : null;

      if (phaseIds && phaseIds.length > 1) {
        const index = indexOf(phaseIds, selectedPhaseId);
        const newIndex = (index < (phaseIds.length - 1) ? index + 1 : 0);
        this.selectedPhaseId$.next(phaseIds[newIndex]);
      }
    }
  }

  render() {
    const className = this.props['className'];
    const { locale, currentTenant, phases, currentPhaseId, selectedPhaseId } = this.state;

    if (locale && currentTenant && phases && phases.data.length > 0) {
      let phaseStatus: 'past' | 'present' | 'future' | null = null;
      const phaseIds = (phases ? phases.data.map(phase => phase.id) : null);
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
      // const currentTenantTimezone = currentTenant.data.attributes.settings.core.timezone;
      // const currentTenantTodayMoment = moment().tz(currentTenantTimezone);
      const selectedPhase = (selectedPhaseId ? phases.data.find(phase => phase.id === selectedPhaseId) : null);
      const selectedPhaseStart = (selectedPhase ? moment(selectedPhase.attributes.start_at, 'YYYY-MM-DD').format('LL') : null);
      const selectedPhaseEnd = (selectedPhase ? moment(selectedPhase.attributes.end_at, 'YYYY-MM-DD').format('LL') : null);
      const selectedPhaseTitle = (selectedPhase ? getLocalized(selectedPhase.attributes.title_multiloc, locale, currentTenantLocales) : null);
      const selectedPhaseNumber = (selectedPhase ? indexOf(phaseIds, selectedPhaseId) + 1 : null);
      const isSelected = (selectedPhaseId !== null);
      // const firstPhaseSelected = (phases && selectedPhaseId && selectedPhaseId === phases.data[0].id ? true : false);
      // const lastPhaseSelected = (phases && selectedPhaseId && selectedPhaseId === phases.data[phases.data.length - 1].id ? true : false);

      if (selectedPhase) {
        if (currentPhaseId && selectedPhaseId === currentPhaseId) {
          phaseStatus = 'present';
        } else if (moment().diff(moment(selectedPhase.attributes.start_at, 'YYYY-MM-DD'), 'days') <= 0) {
          phaseStatus = 'future';
        } else if (moment().diff(moment(selectedPhase.attributes.start_at, 'YYYY-MM-DD'), 'days') > 0) {
          phaseStatus = 'past';
        }
      }

      return (
        <Container className={className}>
          <Header>
            <HeaderLeftSection>
              {isSelected &&
                <PhaseNumberWrapper className={`${isSelected && 'selected'} ${phaseStatus === 'present' && 'current'}`}>
                  <PhaseNumber className={`${isSelected && 'selected'} ${phaseStatus === 'present' && 'current'}`}>
                    {selectedPhaseNumber}
                  </PhaseNumber>
                </PhaseNumberWrapper>
              }

              <HeaderTitleWrapper>
                <HeaderTitle className={`${isSelected && 'selected'} ${phaseStatus === 'present' && 'current'}`}>
                  {selectedPhaseTitle || <FormattedMessage {...messages.noPhaseSelected} />}
                </HeaderTitle>
                <MobileDate>
                  {phaseStatus === 'past' && (
                    <FormattedMessage {...messages.endedOn} values={{ date: selectedPhaseEnd }} />
                  )}

                  {phaseStatus === 'present' && (
                    <FormattedMessage {...messages.endsOn} values={{ date: selectedPhaseEnd }} />
                  )}

                  {phaseStatus === 'future' && (
                    <FormattedMessage {...messages.startsOn} values={{ date: selectedPhaseStart }} />
                  )}
                </MobileDate>
              </HeaderTitleWrapper>
            </HeaderLeftSection>

            <HeaderRightSection>
              <HeaderDate>
                {isSelected &&
                  <HeaderSubtitle>
                    {phaseStatus === 'past' && (
                      <FormattedMessage {...messages.endedOn} values={{ date: selectedPhaseEnd }} />
                    )}

                    {phaseStatus === 'present' && (
                      <FormattedMessage {...messages.endsOn} values={{ date: selectedPhaseEnd }} />
                    )}

                    {phaseStatus === 'future' && (
                      <FormattedMessage {...messages.startsOn} values={{ date: selectedPhaseStart }} />
                    )}
                  </HeaderSubtitle>
                }
              </HeaderDate>

              <IdeaButton
                projectId={this.props.projectId}
                phaseId={selectedPhaseId}
              />
            </HeaderRightSection>
          </Header>

          <Responsive maxWidth={481}>
            <MobileTimelineContainer>
              <MobileTimeline
                phases={phases.data}
                currentPhase={currentPhaseId}
                selectedPhase={selectedPhaseId}
                onPhaseSelection={this.handlePhaseOnClick}
              />
            </MobileTimelineContainer>
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
                  <PhaseContainer
                    className={`${isFirst && 'first'} ${isLast && 'last'} ${isCurrentPhase && 'current'} ${isSelectedPhase && 'selected'}`}
                    key={index}
                    numberOfDays={numberOfDays}
                    onClick={this.handlePhaseOnClick(phase.id)}
                  >
                    <PhaseBar>
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
        </Container>
      );
    }

    return null;
  }
}

