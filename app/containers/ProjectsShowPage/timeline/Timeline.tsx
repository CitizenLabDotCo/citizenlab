import React, { PureComponent, FormEvent } from 'react';
import { isString, forEach, findIndex } from 'lodash-es';
import { Subscription, BehaviorSubject, combineLatest } from 'rxjs';
import {
  tap,
  filter,
  switchMap,
  distinctUntilChanged,
  map,
} from 'rxjs/operators';
import moment from 'moment';
import { withRouter, WithRouterProps } from 'react-router';
import Tippy from '@tippyjs/react';

// tracking
import tracks from './tracks';
import { trackEventByName } from 'utils/analytics';

// components
import ContentContainer from 'components/ContentContainer';
import { Icon, Button } from 'cl2-component-library';
import { ProjectPageSectionTitle } from 'containers/ProjectsShowPage/styles';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import {
  phasesStream,
  IPhases,
  IPhaseData,
  getCurrentPhase,
} from 'services/phases';

// i18n
import messages from 'containers/ProjectsShowPage/messages';
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

const greyOpaque = `${colors.label}`;
const greenTransparent = `${rgba(colors.clGreen, 0.15)}`;
const greenOpaque = `${colors.clGreen}`;

const Container = styled.div<{ isHidden: boolean }>`
  width: 100%;
  display: ${(props) => (props.isHidden ? 'none' : 'flex')};
  justify-content: center;
`;

const ContainerInner = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25px;
`;

const StyledProjectPageSectionTitle = styled(ProjectPageSectionTitle)`
  margin: 0px;
  padding: 0px;
`;

const PhaseNavigation = styled.div`
  display: flex;
  align-items: center;
  margin-left: 15px;
`;

const PhaseNavigationButtonWrapper = styled.div``;

const PhaseButton = styled(Button)``;

const PreviousPhaseButton = styled(PhaseButton)`
  margin-right: 3px;
`;

const CurrentPhaseButton = styled(PhaseButton)``;

const NextPhaseButton = styled(PhaseButton)`
  margin-left: 3px;
`;

const Phases = styled.div`
  width: 100%;
  padding-top: 5px;
  padding-bottom: 30px;
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
  height: calc(${phaseBarHeight} - 1px);
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.small}px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${darken(0.08, colors.lightGreyishBlue)};
  transition: background 60ms ease-out;
  position: relative;
  cursor: pointer;
  border: none;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
`;

const PhaseBarText = styled.span``;

const PhaseArrow = styled(Icon)`
  width: 20px;
  height: ${phaseBarHeight};
  fill: ${colors.background};
  position: absolute;
  top: 0px;
  right: -9px;
  z-index: 2;
`;

const PhaseText = styled.div<{ current: boolean; selected: boolean }>`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.small}px;
  font-weight: 500;
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
  margin-top: 8px;
  margin-left: 5px;
  margin-right: 5px;
  transition: color 60ms ease-out;
`;

const selectedPhaseBar = css`
  ${PhaseBar} {
    background: ${greyOpaque};
    color: #fff;
  }
  ${PhaseText} {
    color: ${greyOpaque};
  }
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
  ${PhaseText} {
    color: ${greenOpaque};
  }
`;

const PhaseContainer = styled.div<{ width: number }>`
  width: ${(props) => props.width}%;
  min-width: 80px;
  display: flex;
  flex-direction: column;
  position: relative;
  cursor: pointer;
  margin-right: ${(props: any) => (!props.last ? '1px' : '0px')};

  &.first ${PhaseBar} {
    border-radius: ${(props: any) => props.theme.borderRadius} 0px 0px
      ${(props: any) => props.theme.borderRadius};
  }

  &.last ${PhaseBar} {
    border-radius: 0px ${(props: any) => props.theme.borderRadius}
      ${(props: any) => props.theme.borderRadius} 0px;
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
export const selectedPhase$ = eventEmitter
  .observeEvent<ISelectedPhase>(SelectedPhaseEventName)
  .pipe(
    map((event) => event.eventValue),
    distinctUntilChanged((x, y) => x?.id === y?.id)
  );

const SelectCurrentPhaseEventName = 'SelectCurrentPhaseEvent';
export const selectCurrentPhase = () =>
  eventEmitter.emit(SelectCurrentPhaseEventName);

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

class Timeline extends PureComponent<
  Props & InjectedIntlProps & WithRouterProps,
  State
> {
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
      loaded: false,
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
          filter((projectId) => isString(projectId)),
          switchMap((projectId: string) => {
            const phases$ = phasesStream(projectId).observable;

            return combineLatest(locale$, currentTenant$, phases$);
          })
        )
        .subscribe(([locale, currentTenant, phases]) => {
          const currentPhase = getCurrentPhase(phases.data);
          const currentPhaseId = currentPhase ? currentPhase.id : null;
          const selectedPhase = this.getDefaultSelectedPhase(
            currentPhase,
            phases
          );
          this.setState({
            locale,
            currentTenant,
            phases,
            currentPhaseId,
            selectedPhase,
            loaded: true,
          });
        }),
      eventEmitter.observeEvent(SelectCurrentPhaseEventName).subscribe(() => {
        if (this.state.phases) {
          const currentPhase = getCurrentPhase(this.state.phases.data);
          this.setState({ selectedPhase: currentPhase });
        }
      }),
    ];
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    this.projectId$.next(this.props.projectId);

    const oldSelectedPhaseId = prevState.selectedPhase
      ? prevState.selectedPhase.id
      : null;
    const newSelectedPhaseId = this.state.selectedPhase
      ? this.state.selectedPhase.id
      : null;

    if (newSelectedPhaseId !== oldSelectedPhaseId) {
      eventEmitter.emit<ISelectedPhase>(
        SelectedPhaseEventName,
        this.state.selectedPhase
      );
    }
  }

  componentWillUnmount() {
    eventEmitter.emit<ISelectedPhase>(SelectedPhaseEventName);
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }

  getDefaultSelectedPhase(
    currentPhase: ISelectedPhase,
    phases: IPhases | null
  ) {
    let selectedPhase: ISelectedPhase = null;
    const { location } = this.props;

    // if, coming from the siteMap, a phase url parameter was passed in, we pick that phase as the default phase,
    // then remove the param so that when the user navigates to other phases there is no mismatch
    if (location.query.phase && typeof location.query.phase === 'string') {
      const phase = phases
        ? phases.data.find((phase) => phase.id === location.query.phase)
        : null;
      if (phase) {
        window.history.replaceState(null, '', location.pathname);
        return phase;
      }
    }

    if (isString(currentPhase)) {
      selectedPhase = currentPhase;
    } else if (phases && phases.data.length > 0) {
      forEach(phases.data, (phase) => {
        const phaseTime = pastPresentOrFuture([
          phase.attributes.start_at,
          phase.attributes.end_at,
        ]);

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

  handleOnPhaseSelection = (selectedPhase: ISelectedPhase) => (
    event: FormEvent
  ) => {
    trackEventByName(tracks.clickOnPhase);

    event.preventDefault();
    this.setState({ selectedPhase });
  };

  handleOnPhaseSelectionFromDropdown = (selectedPhase: ISelectedPhase) => {
    this.setState({ selectedPhase });
  };

  goToNextPhase = () => {
    trackEventByName(tracks.clickNextPhaseButton);

    const { selectedPhase } = this.state;
    const selectedPhaseId = selectedPhase ? selectedPhase.id : null;
    const phases = this.state.phases as IPhases;
    const selectedPhaseIndex = findIndex(
      phases.data,
      (phase) => phase.id === selectedPhaseId
    );
    const nextPhaseIndex =
      phases.data.length >= selectedPhaseIndex + 2 ? selectedPhaseIndex + 1 : 0;
    const nextPhase = phases.data[nextPhaseIndex];
    this.setState({ selectedPhase: nextPhase });
  };

  goToPreviousPhase = () => {
    trackEventByName(tracks.clickPreviousPhaseButton);

    const { selectedPhase } = this.state;
    const selectedPhaseId = selectedPhase ? selectedPhase.id : null;
    const phases = this.state.phases as IPhases;
    const selectedPhaseIndex = findIndex(
      phases.data,
      (phase) => phase.id === selectedPhaseId
    );
    const prevPhaseIndex =
      selectedPhaseIndex > 0 ? selectedPhaseIndex - 1 : phases.data.length - 1;
    const prevPhase = phases.data[prevPhaseIndex];
    this.setState({ selectedPhase: prevPhase });
  };

  goToCurrentPhase = () => {
    const { phases } = this.state;

    if (phases) {
      trackEventByName(tracks.clickCurrentPhaseButton);
      const currentPhase = getCurrentPhase(phases.data);
      this.setState({ selectedPhase: currentPhase });
    }
  };

  removeFocus = (event: React.MouseEvent) => {
    event.preventDefault();
  };

  render() {
    const {
      className,
      intl: { formatMessage },
    } = this.props;
    const {
      locale,
      currentTenant,
      phases,
      currentPhaseId,
      selectedPhase,
    } = this.state;
    const selectedPhaseId = selectedPhase ? selectedPhase.id : null;

    if (locale && currentTenant && phases && phases.data.length > 0) {
      const currentTenantLocales =
        currentTenant.data.attributes.settings.core.locales;
      const totalNumberOfDays = phases.data
        .map((phaseData) => {
          const startIsoDate = getIsoDate(phaseData.attributes.start_at);
          const endIsoDate = getIsoDate(phaseData.attributes.end_at);
          const startMoment = moment(startIsoDate, 'YYYY-MM-DD');
          const endMoment = moment(endIsoDate, 'YYYY-MM-DD');
          const numberOfDays =
            Math.abs(startMoment.diff(endMoment, 'days')) + 1;
          return numberOfDays;
        })
        .reduce((accumulator, numberOfDays) => {
          return accumulator + numberOfDays;
        });

      return (
        <Container
          id="project-timeline"
          className={className}
          isHidden={phases.data.length === 1}
        >
          <ContentContainer>
            <ContainerInner>
              <Header>
                <StyledProjectPageSectionTitle>
                  <FormattedMessage {...messages.timeline} />
                </StyledProjectPageSectionTitle>

                <PhaseNavigation>
                  <Tippy
                    disabled={selectedPhaseId === phases.data[0].id}
                    interactive={false}
                    placement="bottom"
                    content={formatMessage(messages.previousPhase)}
                    theme="translucent"
                    arrow={false}
                    hideOnClick={false}
                  >
                    <PhaseNavigationButtonWrapper>
                      <PreviousPhaseButton
                        locale={locale}
                        onClick={this.goToPreviousPhase}
                        icon="chevron-left"
                        iconSize="12px"
                        buttonStyle="white"
                        width="35px"
                        height="30px"
                        padding="0px"
                        borderColor="#eee"
                        borderHoverColor="#ccc"
                        boxShadow="0px 2px 2px 0px rgba(0, 0, 0, 0.06)"
                        boxShadowHover="0px 2px 2px 0px rgba(0, 0, 0, 0.1)"
                        disabled={selectedPhaseId === phases.data[0].id}
                        ariaLabel={formatMessage(messages.previousPhase)}
                        className="e2e-previous-phase"
                      />
                    </PhaseNavigationButtonWrapper>
                  </Tippy>
                  {currentPhaseId && (
                    <Tippy
                      disabled={selectedPhaseId === currentPhaseId}
                      interactive={false}
                      placement="bottom"
                      content={formatMessage(messages.currentPhase)}
                      theme="translucent"
                      arrow={false}
                      hideOnClick={false}
                    >
                      <PhaseNavigationButtonWrapper>
                        <CurrentPhaseButton
                          locale={locale}
                          onClick={this.goToCurrentPhase}
                          icon="dot"
                          iconSize="8px"
                          iconColor={colors.clGreen}
                          buttonStyle="white"
                          width="35px"
                          height="30px"
                          padding="0px"
                          borderColor="#eee"
                          borderHoverColor="#ccc"
                          boxShadow="0px 2px 2px 0px rgba(0, 0, 0, 0.06)"
                          boxShadowHover="0px 2px 2px 0px rgba(0, 0, 0, 0.1)"
                          disabled={selectedPhaseId === currentPhaseId}
                          ariaLabel={formatMessage(messages.currentPhase)}
                          className="e2e-current-phase"
                        />
                      </PhaseNavigationButtonWrapper>
                    </Tippy>
                  )}
                  <Tippy
                    disabled={
                      selectedPhaseId === phases.data[phases.data.length - 1].id
                    }
                    interactive={false}
                    placement="bottom"
                    content={formatMessage(messages.nextPhase)}
                    theme="translucent"
                    arrow={false}
                    hideOnClick={false}
                  >
                    <PhaseNavigationButtonWrapper>
                      <NextPhaseButton
                        locale={locale}
                        onClick={this.goToNextPhase}
                        icon="chevron-right"
                        iconSize="12px"
                        buttonStyle="white"
                        width="35px"
                        height="30px"
                        padding="0px"
                        borderColor="#eee"
                        borderHoverColor="#ccc"
                        boxShadow="0px 2px 2px 0px rgba(0, 0, 0, 0.06)"
                        boxShadowHover="0px 2px 2px 0px rgba(0, 0, 0, 0.1)"
                        disabled={
                          selectedPhaseId ===
                          phases.data[phases.data.length - 1].id
                        }
                        ariaLabel={formatMessage(messages.nextPhase)}
                      />
                    </PhaseNavigationButtonWrapper>
                  </Tippy>
                </PhaseNavigation>
              </Header>

              <Phases className="e2e-phases">
                <ScreenReaderOnly>
                  <FormattedMessage {...messages.a11y_phasesOverview} />
                </ScreenReaderOnly>
                {phases.data.map((phase, index) => {
                  const phaseNumber = index + 1;
                  const phaseTitle = getLocalized(
                    phase.attributes.title_multiloc,
                    locale,
                    currentTenantLocales
                  );
                  const isFirst = index === 0;
                  const isLast = index === phases.data.length - 1;
                  const isCurrentPhase = phase.id === currentPhaseId;
                  const isSelectedPhase = phase.id === selectedPhaseId;
                  const startIsoDate = getIsoDate(phase.attributes.start_at);
                  const endIsoDate = getIsoDate(phase.attributes.end_at);
                  const startMoment = moment(startIsoDate, 'YYYY-MM-DD');
                  const endMoment = moment(endIsoDate, 'YYYY-MM-DD');
                  const numberOfDays =
                    Math.abs(startMoment.diff(endMoment, 'days')) + 1;
                  const width = Math.round(
                    (numberOfDays / totalNumberOfDays) * 100
                  );
                  // const width = Math.round(100 / phases.data.length);
                  const classNames = [
                    isFirst ? 'first' : null,
                    isLast ? 'last' : null,
                    isCurrentPhase ? 'currentPhase' : null,
                    isSelectedPhase ? 'selectedPhase' : null,
                  ]
                    .filter((className) => className)
                    .join(' ');

                  return (
                    <PhaseContainer
                      className={classNames}
                      key={index}
                      width={width}
                      onMouseDown={this.removeFocus}
                      onClick={this.handleOnPhaseSelection(phase)}
                    >
                      <PhaseBar>
                        <PhaseBarText aria-hidden>{phaseNumber}</PhaseBarText>
                        <ScreenReaderOnly>
                          <FormattedMessage
                            {...messages.a11y_phaseX}
                            values={{
                              phaseNumber,
                              phaseTitle,
                            }}
                          />
                        </ScreenReaderOnly>
                        {!isLast && (
                          <PhaseArrow name="phase_arrow" ariaHidden />
                        )}
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
          </ContentContainer>
        </Container>
      );
    }

    return null;
  }
}

export default withRouter<Props>(injectIntl<Props & WithRouterProps>(Timeline));
