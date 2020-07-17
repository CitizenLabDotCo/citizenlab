import React, { PureComponent, FormEvent } from 'react';
import { indexOf, isString, forEach, findIndex } from 'lodash-es';
import { Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import { tap, filter, switchMap, distinctUntilChanged, map } from 'rxjs/operators';
import moment from 'moment';
import bowser from 'bowser';
import { withRouter, WithRouterProps } from 'react-router';

// tracking
import tracks from './tracks';
import { trackEventByName } from 'utils/analytics';

// components
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';
import IdeaButton from 'components/IdeaButton';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { phasesStream, IPhases, IPhaseData, getCurrentPhase } from 'services/phases';

// i18n
import messages from '../messages';
import { getLocalized } from 'utils/i18n';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// events
import eventEmitter from 'utils/eventEmitter';

// utils
import { pastPresentOrFuture, getIsoDate } from 'utils/dateUtils';

// style
import styled, { css } from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import { darken, rgba } from 'polished';

// typings
import { Locale } from 'typings';

const padding = 30;
const mobilePadding = 15;
const greyOpaque = `${colors.label}`;
const greenTransparent = `${rgba(colors.clGreen, 0.15)}`;
const greenOpaque = `${colors.clGreen}`;

const Container = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const ContainerInner = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: ${(props: any) => props.theme.borderRadius};
`;

const Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  background-color: #fff;
  padding-left: ${padding}px;
  padding-right: ${padding}px;
  padding-top: 8px;
  padding-bottom: 8px;
  border-bottom: solid 1px ${colors.separation};

  ${media.smallerThanMinTablet`
    padding-left: ${mobilePadding}px;
    padding-right: ${mobilePadding}px;
  `}
`;

const HeaderRows = styled.div`
  width: 100%;
  max-width: ${(props) => props.theme.maxPageWidth}px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const HeaderFirstRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${media.smallerThanMinTablet`
    align-items: flex-start;
    padding-top: 8px;
    padding-bottom: 8px;
  `}
`;

const HeaderSecondRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${media.biggerThanMinTablet`
    display: none;
  `}
`;

const HeaderLeftSection = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  display: flex;
  align-items: center;
  padding-top: 8px;
  padding-bottom: 8px;

  ${media.smallerThanMinTablet`
    align-items: flex-start;
    padding: 0px;
  `}
`;

const HeaderRightSection = styled.div`
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: auto;
  display: flex;
  align-items: center;
`;

const PhaseNumberWrapper = styled.div`
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 32px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border-radius: 50%;
  background: ${greyOpaque};

  &.present {
    background: ${greenOpaque};
  }

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const PhaseNumber = styled.div`
  color: #fff;
  font-size: ${fontSizes.base}px;
  line-height: 16px;
  font-weight: 500;
`;

const HeaderTitleWrapper = styled.div`
  min-height: 55px;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  display: flex;
  align-items: center;
  flex-direction: row;

  &.ie {
    height: 55px;
    min-height: auto;
  }

  ${media.smallerThanMinTablet`
    min-height: unset;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    margin-right: 0px;
  `}
`;

const HeaderTitle = styled.h2`
  color: ${colors.text};
  font-size: ${fontSizes.large}px;
  line-height: 25px;
  font-weight: 600;
  margin: 0;
  margin-right: 20px;
  padding: 0;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  ${media.smallerThanMinTablet`
    font-size: ${fontSizes.large}px;
    line-height: 24px;
  `}
`;

const MobileDate = styled.div`
   color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: 21px;
  font-weight: 400;
  margin-top: 3px;
  display: none;

  ${media.smallerThanMinTablet`
    display: block;
  `}
`;

const HeaderSubtitle = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: 20px;
  font-weight: 400;
  margin-top: 3px;
`;

const HeaderDate = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  line-height: 16px;
  white-space: nowrap;
  margin-right: 15px;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const IdeaButtonDesktop = styled(IdeaButton)`
  & > div {
    margin-right: 15px;
  }

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const IdeaButtonMobile = styled(IdeaButton)`
  flex: 1;
  width: 100%;
  padding-top: 10px;
  padding-bottom: 10px;
`;

const PhaseNavigation = styled.div`
  display: flex;
`;

const PhaseButton = styled(Button)``;

const PreviousPhaseButton = styled(PhaseButton)`
  margin-right: 8px;
`;

const NextPhaseButton = styled(PhaseButton)``;

const Phases = styled.div`
  width: 100%;
  max-width: 1100px;
  padding-left: ${padding}px;
  padding-right: ${padding}px;
  padding-top: 60px;
  padding-bottom: 60px;
  margin: 0;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;

  ${media.smallerThanMinTablet`
    display: none;
  `}
`;

const phaseBarHeight = '25px';

const PhaseBar = styled.button`
  width: 100%;
  height: calc( ${phaseBarHeight} - 1px );
  color: ${greyOpaque};
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${colors.lightGreyishBlue};
  transition: background 60ms ease-out;
  position: relative;
  cursor: pointer;
  border: none;
  -webkit-appearance: none;
  -moz-appearance: none;
`;

const PhaseBarText = styled.span``;

const PhaseArrow = styled(Icon)`
  width: 20px;
  height: ${phaseBarHeight};
  fill: #fff;
  position: absolute;
  top: 0px;
  right: -9px;
  z-index: 2;
`;

const PhaseText = styled.div<{ current: boolean, selected: boolean }>`
  color: ${greyOpaque};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-height: 20px;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-all;
  word-break: break-word;
  hyphens: auto;
  max-height: 60px;
  margin-top: 12px;
  margin-left: 5px;
  margin-right: 5px;
  transition: color 60ms ease-out;
`;

const selectedPhaseBar = css`
  ${PhaseBar} {
    background: ${greyOpaque};
    color: #fff
  }
  ${PhaseText} { color: ${greyOpaque}; }
`;

const currentPhaseBar = css`
  ${PhaseBar} {
    background: ${greenTransparent};
    color: ${darken(0.04, greenOpaque)};
  }
  ${PhaseText} {
    color: ${darken(0.04, greenOpaque)};
  }
`;

const currentSelectedPhaseBar = css`
  ${PhaseBar} {
    background: ${greenOpaque};
    color: #fff;
  }
  ${PhaseText} { color: ${greenOpaque}; }
`;

const PhaseContainer = styled.div<{ width: number }>`
  width: ${(props) => props.width}%;
  min-width: 80px;
  display: flex;
  flex-direction: column;
  position: relative;
  cursor: pointer;
  margin-right:  ${(props: any) => !props.last ? '1px' : '0px' };

  &.first ${PhaseBar} {
    border-radius: ${(props: any) => props.theme.borderRadius} 0px 0px ${(props: any) => props.theme.borderRadius};
  }

  &.last ${PhaseBar} {
    border-radius: 0px ${(props: any) => props.theme.borderRadius} ${(props: any) => props.theme.borderRadius} 0px;
  }

  &:focus,
  &:hover {
    ${selectedPhaseBar}
  }

  &.currentPhase:not(.selectedPhase) {
    ${currentPhaseBar}

    &:hover {
      ${currentSelectedPhaseBar}
    }
  }

  &.selectedPhase:not(.currentPhase) {
    ${selectedPhaseBar}
  }

  &.selectedPhase.currentPhase {
    ${currentSelectedPhaseBar}
  }
`;

const SelectedPhaseEventName = 'SelectedPhaseChangeEvent';
type ISelectedPhase = IPhaseData | null;
export const selectedPhase$ = eventEmitter.observeEvent<ISelectedPhase>(SelectedPhaseEventName).pipe(
  map(event => event.eventValue),
  distinctUntilChanged((x, y) => x?.id === y?.id)
);

interface Props {
  projectId: string;
  className?: string;
}

interface State {
  locale: Locale | null;
  currentTenant: ITenant | null;
  phases: IPhases | null;
  currentPhaseId: string | null;
  selectedPhase: ISelectedPhase;
  loaded: boolean;
}

class Timeline extends PureComponent<Props & InjectedIntlProps & WithRouterProps, State> {
  initialState: State;
  projectId$: BehaviorSubject<string | null>;
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    const initialState = {
      locale: null,
      currentTenant: null,
      phases: null,
      currentPhaseId: null,
      selectedPhase: null,
      loaded: false
    };
    this.initialState = initialState;
    this.state = initialState;
    this.subscriptions = [];
    this.projectId$ = new BehaviorSubject(null);
  }

  componentDidMount() {
    this.projectId$.next(this.props.projectId);

    const projectId$ = this.projectId$.pipe(distinctUntilChanged());
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;

    eventEmitter.emit<ISelectedPhase>(SelectedPhaseEventName);

    this.subscriptions = [
      projectId$
        .pipe(
          tap(() => this.setState(this.initialState)),
          filter(projectId => isString(projectId)),
          switchMap((projectId: string) => {
            const phases$ = phasesStream(projectId).observable;

            return combineLatest(
              locale$,
              currentTenant$,
              phases$
            );
          })
        )
        .subscribe(([locale, currentTenant, phases]) => {
          const currentPhase = getCurrentPhase(phases.data);
          const currentPhaseId = currentPhase ? currentPhase.id : null;
          const selectedPhase = this.getDefaultSelectedPhase(currentPhase, phases);
          this.setState({ locale, currentTenant, phases, currentPhaseId, selectedPhase, loaded: true });
        })
    ];
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    this.projectId$.next(this.props.projectId);

    const oldSelectedPhaseId = prevState.selectedPhase ? prevState.selectedPhase.id : null;
    const newSelectedPhaseId = this.state.selectedPhase ? this.state.selectedPhase.id : null;

    if (newSelectedPhaseId !== oldSelectedPhaseId) {
      eventEmitter.emit<ISelectedPhase>(SelectedPhaseEventName, this.state.selectedPhase);
    }
  }

  componentWillUnmount() {
    eventEmitter.emit<ISelectedPhase>(SelectedPhaseEventName);
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getDefaultSelectedPhase(currentPhase: ISelectedPhase, phases: IPhases | null) {
    let selectedPhase: ISelectedPhase = null;
    const { location } = this.props;

    // if, coming from the siteMap, a phase url parameter was passed in, we pick that phase as the default phase,
    // then remove the param so that when the user navigates to other phases there is no mismatch
    if (location.query.phase && typeof location.query.phase === 'string') {
      const phase = phases ? phases.data.find(phase => phase.id === location.query.phase) : null;
      if (phase) {
        window.history.replaceState(null, '', location.pathname);
        return phase;
      }
    }

    if (isString(currentPhase)) {
      selectedPhase = currentPhase;
    } else if (phases && phases.data.length > 0) {
      forEach(phases.data, (phase) => {
        const phaseTime = pastPresentOrFuture([phase.attributes.start_at, phase.attributes.end_at]);

        if (phaseTime === 'present' || phaseTime === 'future') {
          selectedPhase = phase;
          return false;
        }

        return true;
      });

      if (!selectedPhase) {
        selectedPhase = phases.data[phases.data.length - 1];
      }
    }

    return selectedPhase;
  }

  handleOnPhaseSelection = (selectedPhase: ISelectedPhase) => (event: FormEvent) => {
    trackEventByName(tracks.clickOnPhase);

    event.preventDefault();
    this.setState({ selectedPhase });
  }

  handleOnPhaseSelectionFromDropdown = (selectedPhase: ISelectedPhase) => {
    this.setState({ selectedPhase });
  }

  goToNextPhase = () => {
    trackEventByName(tracks.clickNextPhaseButton);

    const { selectedPhase } = this.state;
    const selectedPhaseId = selectedPhase ? selectedPhase.id : null;
    const phases = this.state.phases as IPhases;
    const selectedPhaseIndex = findIndex(phases.data, phase => phase.id === selectedPhaseId);
    const nextPhaseIndex = phases.data.length >= selectedPhaseIndex + 2 ? selectedPhaseIndex + 1 : 0;
    const nextPhase = phases.data[nextPhaseIndex];
   this.setState({ selectedPhase: nextPhase });
  }

  goToPreviousPhase = () => {
    trackEventByName(tracks.clickPreviousPhaseButton);

    const { selectedPhase } = this.state;
    const selectedPhaseId = selectedPhase ? selectedPhase.id : null;
    const phases = this.state.phases as IPhases;
    const selectedPhaseIndex = findIndex(phases.data, phase => phase.id === selectedPhaseId);
    const prevPhaseIndex = selectedPhaseIndex > 0 ? selectedPhaseIndex - 1 : phases.data.length - 1;
    const prevPhase = phases.data[prevPhaseIndex];
    this.setState({ selectedPhase: prevPhase });
  }

  removeFocus = (event: React.MouseEvent) => {
    event.preventDefault();
  }

  render() {
    const { className } = this.props;
    const { locale, currentTenant, phases, currentPhaseId, selectedPhase } = this.state;
    const selectedPhaseId = selectedPhase ? selectedPhase.id : null;

    if (locale && currentTenant && phases && phases.data.length > 0) {
      const phaseIds = (phases ? phases.data.map(phase => phase.id) : null);
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
      const selectedPhase = (selectedPhaseId ? phases.data.find(phase => phase.id === selectedPhaseId) : null);
      const selectedPhaseStart = (selectedPhase
        ? moment(selectedPhase.attributes.start_at, 'YYYY-MM-DD').format('LL')
        : null);
      const selectedPhaseEnd = (selectedPhase
        ? moment(selectedPhase.attributes.end_at, 'YYYY-MM-DD').format('LL')
        : null);
      const mobileSelectedPhaseStart = (selectedPhase
        ? moment(selectedPhase.attributes.start_at, 'YYYY-MM-DD').format('ll')
        : null);
      const mobileSelectedPhaseEnd = (selectedPhase
        ? moment(selectedPhase.attributes.end_at, 'YYYY-MM-DD').format('ll')
        : null);
      const selectedPhaseTitle = (selectedPhase
        ? getLocalized(selectedPhase.attributes.title_multiloc, locale, currentTenantLocales) : null);
      const selectedPhaseNumber = (selectedPhase ? indexOf(phaseIds, selectedPhaseId) + 1 : null);
      const isSelected = (selectedPhaseId !== null);
      const phaseStatus = (selectedPhase && pastPresentOrFuture([selectedPhase.attributes.start_at, selectedPhase.attributes.end_at]));
      const lastPhaseIndex = phases.data.length - 1;
      const totalNumberOfDays = phases.data.map((phaseData) => {
        const startIsoDate = getIsoDate(phaseData.attributes.start_at);
        const endIsoDate = getIsoDate(phaseData.attributes.end_at);
        const startMoment = moment(startIsoDate, 'YYYY-MM-DD');
        const endMoment = moment(endIsoDate, 'YYYY-MM-DD');
        const numberOfDays = Math.abs(startMoment.diff(endMoment, 'days')) + 1;
        return numberOfDays;
      }).reduce((accumulator, numberOfDays) => {
        return accumulator + numberOfDays;
      });

      return (
        <Container className={className}>
          <ContainerInner>
            <Header>
              <HeaderRows>
                <HeaderFirstRow aria-live="polite">
                  <HeaderLeftSection>
                    {isSelected &&
                      <PhaseNumberWrapper aria-hidden className={`${isSelected && 'selected'} ${phaseStatus}`}>
                        <PhaseNumber className={`${isSelected && 'selected'} ${phaseStatus}`}>
                          {selectedPhaseNumber}
                        </PhaseNumber>
                      </PhaseNumberWrapper>
                    }

                    <HeaderTitleWrapper className={bowser.msie ? 'ie' : ''}>
                      <HeaderTitle aria-hidden className={`${isSelected && 'selected'} ${phaseStatus}`}>
                        {selectedPhaseTitle || <FormattedMessage {...messages.noPhaseSelected} />}
                      </HeaderTitle>
                      <ScreenReaderOnly>
                        <FormattedMessage
                          {...messages.a11y_selectedPhaseX}
                          values={{
                            selectedPhaseNumber,
                            selectedPhaseTitle
                          }}
                        />
                      </ScreenReaderOnly>
                      <MobileDate>
                        {phaseStatus === 'past' && (
                          <FormattedMessage {...messages.endedOn} values={{ date: mobileSelectedPhaseEnd }} />
                        )}

                        {phaseStatus === 'present' && (
                          <FormattedMessage {...messages.endsOn} values={{ date: mobileSelectedPhaseEnd }} />
                        )}

                        {phaseStatus === 'future' && (
                          <FormattedMessage {...messages.startsOn} values={{ date: mobileSelectedPhaseStart }} />
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

                    <IdeaButtonDesktop
                      projectId={this.props.projectId}
                      phaseId={selectedPhaseId}
                      participationContextType="phase"
                    />

                    <PhaseNavigation>
                      <PreviousPhaseButton
                        onClick={this.goToPreviousPhase}
                        icon="chevron-left"
                        iconSize="15px"
                        buttonStyle="secondary"
                        padding="10px"
                        disabled={selectedPhaseId === phases.data[0].id}
                        ariaLabel={this.props.intl.formatMessage(messages.goToPreviousPhase)}
                        className="e2e-previous-phase"
                      />
                      <NextPhaseButton
                        onClick={this.goToNextPhase}
                        icon="chevron-right"
                        iconSize="15px"
                        buttonStyle="secondary"
                        padding="10px"
                        disabled={selectedPhaseId === phases.data[lastPhaseIndex].id}
                        ariaLabel={this.props.intl.formatMessage(messages.goToNextPhase)}
                      />
                    </PhaseNavigation>
                  </HeaderRightSection>
                </HeaderFirstRow>

                <HeaderSecondRow>
                  <IdeaButtonMobile
                    projectId={this.props.projectId}
                    phaseId={selectedPhaseId || undefined}
                    fullWidth={true}
                    participationContextType="phase"
                  />
                </HeaderSecondRow>
              </HeaderRows>
            </Header>

            <Phases className="e2e-phases">
              <ScreenReaderOnly>
                <FormattedMessage {...messages.a11y_phasesOverview} />
              </ScreenReaderOnly>
              {phases.data.map((phase, index) => {
                const phaseNumber = index + 1;
                const phaseTitle = getLocalized(phase.attributes.title_multiloc, locale, currentTenantLocales);
                const isFirst = (index === 0);
                const isLast = (index === phases.data.length - 1);
                const isCurrentPhase = (phase.id === currentPhaseId);
                const isSelectedPhase = (phase.id === selectedPhaseId);
                const startIsoDate = getIsoDate(phase.attributes.start_at);
                const endIsoDate = getIsoDate(phase.attributes.end_at);
                const startMoment = moment(startIsoDate, 'YYYY-MM-DD');
                const endMoment = moment(endIsoDate, 'YYYY-MM-DD');
                const numberOfDays = Math.abs(startMoment.diff(endMoment, 'days')) + 1;
                const width = Math.round(numberOfDays / totalNumberOfDays * 100);
                // const width = Math.round(100 / phases.data.length);
                const classNames = [
                  isFirst ? 'first' : null,
                  isLast ? 'last' : null,
                  isCurrentPhase ? 'currentPhase' : null,
                  isSelectedPhase ? 'selectedPhase' : null
                ].filter(className => className).join(' ');

                return (
                  <PhaseContainer
                    className={classNames}
                    key={index}
                    width={width}
                    onMouseDown={this.removeFocus}
                    onClick={this.handleOnPhaseSelection(phase)}
                  >
                    <PhaseBar>
                      <PhaseBarText aria-hidden>
                        {phaseNumber}
                      </PhaseBarText>
                      <ScreenReaderOnly>
                        <FormattedMessage
                          {...messages.a11y_phaseX}
                          values={{
                            phaseNumber,
                            phaseTitle
                          }}
                        />
                      </ScreenReaderOnly>
                      {!isLast && <PhaseArrow name="phase_arrow" ariaHidden />}
                    </PhaseBar>
                    <PhaseText
                      current={isCurrentPhase}
                      selected={isSelectedPhase}
                      aria-hidden
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

export default withRouter<Props>(injectIntl<Props & WithRouterProps>(Timeline));
