import * as React from 'react';
import { indexOf, isString } from 'lodash';
import * as Rx from 'rxjs/Rx';
import * as moment from 'moment';
import 'moment-timezone';

// components
import Icon from 'components/UI/Icon';
import IdeaButton from 'components/IdeaButton';
import MobileTimeline from './MobileTimeline';

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

const greyTransparent = css`rgba(121, 137, 147, 0.3)`;
const greyOpaque = css`rgba(121, 137, 147, 1)`;
const greenTransparent = css`rgba(29, 170, 99, 0.3)`;
const greenOpaque = css`rgba(29, 170, 99, 1)`;

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  padding-left: 15px;
  padding-right: 15px;
`;

const padding = 30;

const ContainerInner = styled.div`
  width: 100%;
  max-width: 1050px;
  max-width: ${(props) => props.theme.maxPageWidth + (padding * 2)}px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 5px;
  background: #fff;
  border: solid 1px #e4e4e4;

  * {
    user-select: none;
  }
`;

const Header = styled.div`
  width: 100%;
  min-height: 80px;
  padding: 0px;
  padding-left: ${padding}px;
  padding-right: ${padding}px;
  padding-top: 8px;
  padding-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8f8f8;
  border-bottom: solid 1px #e4e4e4;

  ${media.smallerThanMaxTablet`
    min-height: 120px;
  `}
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
  background: ${greyOpaque};

  &.current {
    background: ${greenOpaque};
  }
`;

const PhaseNumber = styled.div`
  color: #fff;
  font-size: 16px;
  line-height: 16px;
  font-weight: 400;
  margin: 0;
  padding: 0;
`;

const HeaderTitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 15px;

  ${media.smallerThanMaxTablet`
    margin-right: 0px;
  `}
`;

const HeaderTitle = styled.div`
  color: #222;
  font-size: 21px;
  line-height: 25px;
  font-weight: 400;
  margin-right: 20px;

  ${media.smallerThanMaxTablet`
    font-size: 20px;
    line-height: 24px;
  `}
`;

const MobileDate = styled.div`
  color: #999;
  font-size: 15px;
  line-height: 21px;
  font-weight: 400;
  margin-top: 4px;
  display: none;

  ${media.smallerThanMaxTablet`
    display: block;
  `}
`;

const HeaderSubtitle = styled.div`
  color: ${(props) => props.theme.colors.label};
  font-size: 15px;
  line-height: 20px;
  font-weight: 400;
  margin-top: 3px;
`;

const HeaderDate = styled.div`
  color: #000;
  font-size: 14px;
  font-weight: 400;
  line-height: 16px;
  white-space: nowrap;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const StyledIdeaButton: any = styled(IdeaButton)`
  margin-left: 20px;
`;

const MobileTimelineContainer = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: ${padding}px;
  padding-right: ${padding}px;
  padding-top: 30px;
  padding-bottom: 30px;

  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

const Phases = styled.div`
  width: 100%;
  padding-left: ${padding}px;
  padding-right: ${padding}px;
  padding-top: 40px;
  padding-bottom: 40px;
  margin: 0;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
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
  background: ${greyTransparent};
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
  color: ${greyTransparent};
  font-size: 15px;
  font-weight: 400;
  text-align: center;
  /* overflow-wrap: break-word;
  word-wrap: break-word;
  -ms-word-break: break-all;
  word-break: break-all;
  word-break: break-word;
  -ms-hyphens: auto;
  -moz-hyphens: auto;
  -webkit-hyphens: auto;
  hyphens: auto; */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-height: 20px;
  max-height: 60px;
  margin-top: 12px;
  padding-left: 6px;
  padding-right: 6px;
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
  onPhaseSelected: (phaseId: string | null) => void;
};

type State = {
  locale: Locale | null;
  currentTenant: ITenant | null;
  phases: IPhases | null;
  currentPhaseId: string | null;
  selectedPhaseId: string | null;
  loaded: boolean;
};

export default class Timeline extends React.PureComponent<Props, State> {
  initialState: State;
  projectId$: Rx.BehaviorSubject<string | null>;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    const initialState = {
      locale: null,
      currentTenant: null,
      phases: null,
      currentPhaseId: null,
      selectedPhaseId: null,
      loaded: false
    };
    this.initialState = initialState;
    this.state = initialState;
    this.subscriptions = [];
    this.projectId$ = new Rx.BehaviorSubject(null);
  }

  componentDidMount() {
    this.projectId$.next(this.props.projectId);

    const projectId$ = this.projectId$.distinctUntilChanged();
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      projectId$
        .do(() => this.setState(this.initialState))
        .filter(projectId => isString(projectId))
        .switchMap((projectId: string) => {
          const phases$ = phasesStream(projectId).observable;

          return Rx.Observable.combineLatest(
            locale$,
            currentTenant$,
            phases$
          );
        })
        .subscribe(([locale, currentTenant, phases]) => {
          const currentPhaseId = this.getCurrentPhaseId(currentTenant, phases);
          const selectedPhaseId = this.getDefaultSelectedPhaseId(currentPhaseId, phases);
          this.setSelectedPhaseId(selectedPhaseId);
          this.setState({ locale, currentTenant, phases, currentPhaseId, loaded: true });
        })
    ];
  }

  componentDidUpdate(_prevProps: Props, _prevState: State) {
    this.projectId$.next(this.props.projectId);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getCurrentPhaseId(currentTenant: ITenant, phases: IPhases | null) {
    let currentPhaseId: string | null = null;

    if (phases && phases.data.length > 0) {
      const currentTenantTimezone = currentTenant.data.attributes.settings.core.timezone;
      const currentTenantTodayMoment = moment().tz(currentTenantTimezone);

      phases.data.forEach((phase) => {
        const startMoment = moment(phase.attributes.start_at, 'YYYY-MM-DD');
        const endMoment = moment(phase.attributes.end_at, 'YYYY-MM-DD');
        const isCurrentPhase = currentTenantTodayMoment.isBetween(startMoment, endMoment, 'days', '[]');

        if (isCurrentPhase) {
          currentPhaseId = phase.id;
        }
      });
    }

    return currentPhaseId as string | null;
  }

  getDefaultSelectedPhaseId(currentPhaseId: string | null, phases: IPhases | null) {
    let selectedPhaseId: string | null = null;

    if (isString(currentPhaseId)) {
        selectedPhaseId = currentPhaseId;
    } else if (phases && phases.data.length > 0) {
      const lastPhase = phases.data[phases.data.length - 1];

      if (lastPhase && moment().diff(moment(lastPhase.attributes.start_at, 'YYYY-MM-DD'), 'days') <= 0) {
        selectedPhaseId = phases.data[0].id;
      } else if (lastPhase && moment().diff(moment(lastPhase.attributes.start_at, 'YYYY-MM-DD'), 'days') > 0) {
        selectedPhaseId = lastPhase.id;
      }
    }

    return selectedPhaseId;
  }

  setSelectedPhaseId = (selectedPhaseId: string | null) => {
    this.props.onPhaseSelected(selectedPhaseId);
    this.setState({ selectedPhaseId });
  }

  handleOnPhaseSelection = (phaseId: string) => (event: React.FormEvent<MouseEvent>) => {
    event.preventDefault();
    this.setSelectedPhaseId(phaseId);
  }

  handleOnPhaseSelectionFromDropdown = (phaseId: string) => {
    this.setSelectedPhaseId(phaseId);
  }

  render() {
    const className = this.props['className'];
    const { locale, currentTenant, phases, currentPhaseId, selectedPhaseId } = this.state;

    if (locale && currentTenant && phases && phases.data.length > 0) {
      let phaseStatus: 'past' | 'present' | 'future' | null = null;
      const phaseIds = (phases ? phases.data.map(phase => phase.id) : null);
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
      const selectedPhase = (selectedPhaseId ? phases.data.find(phase => phase.id === selectedPhaseId) : null);
      const selectedPhaseStart = (selectedPhase ? moment(selectedPhase.attributes.start_at, 'YYYY-MM-DD').format('LL') : null);
      const selectedPhaseEnd = (selectedPhase ? moment(selectedPhase.attributes.end_at, 'YYYY-MM-DD').format('LL') : null);
      const selectedPhaseTitle = (selectedPhase ? getLocalized(selectedPhase.attributes.title_multiloc, locale, currentTenantLocales) : null);
      const selectedPhaseNumber = (selectedPhase ? indexOf(phaseIds, selectedPhaseId) + 1 : null);
      const isSelected = (selectedPhaseId !== null);

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
          <ContainerInner>
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

                <StyledIdeaButton
                  projectId={this.props.projectId}
                  phaseId={selectedPhaseId}
                />
              </HeaderRightSection>
            </Header>

            <MobileTimelineContainer>
              <MobileTimeline
                phases={phases.data}
                currentPhase={currentPhaseId}
                selectedPhase={selectedPhaseId}
                onPhaseSelection={this.handleOnPhaseSelectionFromDropdown}
              />
            </MobileTimelineContainer>

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
                    onClick={this.handleOnPhaseSelection(phase.id)}
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
          </ContainerInner>
        </Container>
      );
    }

    return null;
  }
}
