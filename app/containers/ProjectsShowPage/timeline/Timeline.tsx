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

const greyTransparent = css`rgba(121, 137, 147, 1)`;
const greyOpaque = css`rgba(121, 137, 147, 1)`;
const greenTransparent = css`rgba(29, 170, 99, 0.5)`;
const greenOpaque = css`rgba(29, 170, 99, 1)`;

const MobileTLContainer = styled.div`
  width: 100%;
  display: flex;
  padding: 30px;
  align-items: center;
  justify-content: center;
`;

const Container = styled.div`
  width: 100%;
  max-width: 1100px;
  margin-left: auto;
  margin-right: auto;
  background: #fff;
  border-radius: 5px;
  border: solid #eaeaea 1px;

  * {
    user-select: none;
  }
`;

const Header = styled.div`
  width: 100%;
  background: #fafafa;
  border-bottom: solid 1px #eaeaea;
  padding: 14px 30px;
  display: flex;
  justify-content: space-between;
`;

const HeaderSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const PhaseNumberWrapper = styled.div`
  flex: 0 0 29px;
  width: 29px;
  height: 29px;
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
    color: ${greenOpaque};
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
`;

const CurrentPhase = styled.span`
  color: ${greenOpaque};
`;

const HeaderNavigationIcon = styled(Icon)`
  fill: #333;
  height: 13px;
  transition: background 60ms ease-out;
`;

const HeaderNavigationPrevIcon = HeaderNavigationIcon.extend`
  transform: rotate(180deg);
`;

const HeaderNavigationNextIcon = HeaderNavigationIcon.extend``;

const HeaderNavigation = styled.div`
  flex: 0 0 26px;
  width: 26px;
  height: 31px;
  background: #e0e0e0;
  border-radius: 4px;
  margin-right: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 60ms ease-out;

  &.last {
    margin-right: 0px;
  }

  &.disabled {
    background: #f0f0f0;
    cursor: not-allowed;

    ${HeaderNavigationPrevIcon},
    ${HeaderNavigationNextIcon} {
      fill: #bbb;
    }
  }

  &:not(.disabled):hover {
    background: #ccc;

    ${HeaderNavigationPrevIcon},
    ${HeaderNavigationNextIcon} {
      fill: #000;
    }
  }
`;

const Phases = styled.div`
  width: 100%;
  padding: 0px 30px;
  margin-left: auto;
  margin-right: auto;
  margin-top: 50px;
  margin-bottom: 40px;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
`;

const phaseBarHeight = '24px';

const PhaseBar: any = styled.div`
  width: 100%;
  height: ${phaseBarHeight};
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
  top: 0;
  right: -9px;
  z-index: 2;
`;

const PhaseText: any = styled.div`
  color: #d0d5d9;
  font-size: 14px;
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
  line-height: 18px;
  max-height: 54px;
  margin-top: 12px;
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
  phaseClick: (phaseId: string | null) => void;
};

type State = {
  locale: string | null;
  currentTenant: ITenant | null;
  phases: IPhases | null;
  currentPhaseId: string | null;
  selectedPhaseId: string | null;
};

export default class Timeline extends React.PureComponent<Props, State> {
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
    this.selectedPhaseId$ = new Rx.BehaviorSubject(null);
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
        phases$,
        this.selectedPhaseId$.distinctUntilChanged()
      ).subscribe(([locale, currentTenant, phases, selectedPhaseId]) => {
        this.setState((state: State) => {
          let currentPhaseId = _.cloneDeep(state.currentPhaseId);

          if (phases && phases.data.length > 0) {
            const currentTenantTimezone = currentTenant.data.attributes.settings.core.timezone;
            const currentTenantTodayMoment = moment().tz(currentTenantTimezone);

            _(phases.data).forEach((phase) => {
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
            this.props.phaseClick(selectedPhaseId);
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

  componentWillUpdate(nextProps: Props, nextState: State) {
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

  handleOnAddIdeaClick = () => {
    // empty
  }

  goToPrevPhase = (firstPhaseSelected: boolean) => (event: React.FormEvent<any>) => {
    event.preventDefault();

    if (!firstPhaseSelected) {
      const { phases, selectedPhaseId } = this.state;
      const phaseIds = phases ? phases.data.map(phase => phase.id) : null;

      if (phaseIds && phaseIds.length > 1) {
        const index = _.indexOf(phaseIds, selectedPhaseId);
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
        const index = _.indexOf(phaseIds, selectedPhaseId);
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
      const currentTenantTimezone = currentTenant.data.attributes.settings.core.timezone;
      const currentTenantTodayMoment = moment().tz(currentTenantTimezone);
      const selectedPhase = (selectedPhaseId ? phases.data.find(phase => phase.id === selectedPhaseId) : null);
      const selectedPhaseStart = (selectedPhase ? moment(selectedPhase.attributes.start_at, 'YYYY-MM-DD').locale(locale).format('LL') : null);
      const selectedPhaseEnd = (selectedPhase ? moment(selectedPhase.attributes.end_at, 'YYYY-MM-DD').locale(locale).format('LL') : null);
      const selectedPhaseTitle = (selectedPhase ? getLocalized(selectedPhase.attributes.title_multiloc, locale, currentTenantLocales) : null);
      const selectedPhaseNumber = (selectedPhase ? _.indexOf(phaseIds, selectedPhaseId) + 1 : null);
      const isSelected = (selectedPhaseId !== null);
      const firstPhaseSelected = (phases && selectedPhaseId && selectedPhaseId === phases.data[0].id ? true : false);
      const lastPhaseSelected = (phases && selectedPhaseId && selectedPhaseId === phases.data[phases.data.length - 1].id ? true : false);

      if (selectedPhase) {
        if (currentPhaseId && selectedPhaseId === currentPhaseId) {
          phaseStatus = 'present';
        } else if (moment().diff(moment(selectedPhase.attributes.start_at, 'YYYY-MM-DD'), 'days') < 0) {
          phaseStatus = 'future';
        } else if (moment().diff(moment(selectedPhase.attributes.start_at, 'YYYY-MM-DD'), 'days') > 0) {
          phaseStatus = 'past';
        }
      }

      return (
        <Container className={className}>
          <Header>
            <HeaderSection>
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
              </HeaderTitleWrapper>
            </HeaderSection>

            <HeaderSection>
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
                      <FormattedMessage {...messages.endsOn} values={{ date: selectedPhaseEnd }} />
                    )}
                  </HeaderSubtitle>
                }
              </HeaderDate>

              <Button
                onClick={this.handleOnAddIdeaClick}
                style="primary"
                size="2"
                text={<FormattedMessage {...messages.startAnIdea} />}
                circularCorners={false}
              />

              {/*
              <HeaderNavigation className={`${firstPhaseSelected && 'disabled'}`} onClick={this.goToPrevPhase(firstPhaseSelected)}>
                <HeaderNavigationPrevIcon name="chevron-right" />
              </HeaderNavigation>

              <HeaderNavigation className={`last ${lastPhaseSelected && 'disabled'}`} onClick={this.goToNextPhase(lastPhaseSelected)}>
                <HeaderNavigationNextIcon name="chevron-right" />
              </HeaderNavigation>
              */}
            </HeaderSection>
          </Header>


          {/* <ContentContainer> */}
            <Responsive maxWidth={481} as={MobileTLContainer} >
              <MobileTimeline
                phases={phases.data}
                currentPhase={currentPhaseId}
                selectedPhase={selectedPhaseId}
                onPhaseSelection={this.handlePhaseOnClick}
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
          {/* </ContentContainer> */}
        </Container>
      );
    }

    return null;
  }
}
