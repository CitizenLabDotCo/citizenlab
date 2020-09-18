import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { indexOf } from 'lodash-es';
import bowser from 'bowser';
import moment from 'moment';

// hooks
import useLocale from 'hooks/useLocale';
import useTenant from 'hooks/useTenant';
import usePhases from 'hooks/usePhases';

// components
import IdeaButton from 'components/IdeaButton';

// i18n
import messages from 'containers/ProjectsShowPage/messages';
import { getLocalized } from 'utils/i18n';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';

// style
import styled from 'styled-components';
import { media, colors, fontSizes } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';

const Container = styled.div<{ bottomMargin: string }>`
  display: flex;
  margin-bottom: ${(props) => props.bottomMargin};
`;

const Left = styled.div`
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  display: flex;
  align-items: center;
`;

const Right = styled.div`
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: auto;
  display: flex;
  align-items: center;
  margin-left: 15px;
`;

const PhaseNumberWrapper = styled.div`
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 37x;
  width: 37px;
  height: 37px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${colors.label};
  margin-right: 11px;

  &.present {
    background: ${colors.clGreen};
  }
`;

const PhaseNumber = styled.div`
  color: #fff;
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 500;
`;

const HeaderTitleWrapper = styled.div`
  min-height: 41px;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  display: flex;
  flex-direction: column;
  margin-right: 20px;

  &.ie {
    height: 41px;
    min-height: unset;
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
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.large}px;
  line-height: normal;
  font-weight: 600;
  margin: 0;
  margin-bottom: 4px;
  padding: 0;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  ${media.smallerThanMinTablet`
    font-size: ${fontSizes.large}px;
  `}
`;

const HeaderSubtitle = styled.div`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 300;
  display: flex;
  align-items: center;
`;

const DatesSeparator = styled.span`
  margin-left: 5px;
  margin-right: 5px;
`;

interface Props {
  projectId: string;
  selectedPhaseId: string | null;
  className?: string;
}

const AboutHeader = memo<Props>(({ projectId, selectedPhaseId, className }) => {
  const locale = useLocale();
  const tenant = useTenant();
  const phases = usePhases(projectId);

  if (
    !isNilOrError(locale) &&
    !isNilOrError(tenant) &&
    !isNilOrError(phases) &&
    phases.length > 0
  ) {
    const phaseIds = phases ? phases.map((phase) => phase.id) : null;
    const tenantLocales = tenant.data.attributes.settings.core.locales;
    const selectedPhase = selectedPhaseId
      ? phases.find((phase) => phase.id === selectedPhaseId)
      : null;
    const selectedPhaseTitle = selectedPhase
      ? getLocalized(
          selectedPhase.attributes.title_multiloc,
          locale,
          tenantLocales
        )
      : null;
    const selectedPhaseNumber = selectedPhase
      ? indexOf(phaseIds, selectedPhaseId) + 1
      : null;
    const isSelected = selectedPhaseId !== null;
    const phaseStatus =
      selectedPhase &&
      pastPresentOrFuture([
        selectedPhase.attributes.start_at,
        selectedPhase.attributes.end_at,
      ]);
    const startDate = moment(
      selectedPhase?.attributes.start_at,
      'YYYY-MM-DD'
    ).format('ll');
    const endDate = moment(
      selectedPhase?.attributes.end_at,
      'YYYY-MM-DD'
    ).format('ll');

    return (
      <Container
        className={className || ''}
        bottomMargin={phases.length > 1 ? '28px' : '10px'}
      >
        <Left>
          {isSelected && phases.length > 1 && (
            <PhaseNumberWrapper
              aria-hidden
              className={`${isSelected && 'selected'} ${phaseStatus}`}
            >
              <PhaseNumber
                className={`${isSelected && 'selected'} ${phaseStatus}`}
              >
                {selectedPhaseNumber}
              </PhaseNumber>
            </PhaseNumberWrapper>
          )}

          <HeaderTitleWrapper className={bowser.msie ? 'ie' : ''}>
            <HeaderTitle
              aria-hidden
              className={`${isSelected && 'selected'} ${phaseStatus}`}
            >
              {selectedPhaseTitle || (
                <FormattedMessage {...messages.noPhaseSelected} />
              )}
            </HeaderTitle>
            {selectedPhase && phases.length > 1 && (
              <HeaderSubtitle>
                {pastPresentOrFuture(selectedPhase.attributes.start_at) ===
                'past' ? (
                  <FormattedMessage
                    {...messages.startedOn}
                    values={{
                      date: startDate,
                    }}
                  />
                ) : (
                  <FormattedMessage
                    {...messages.startsOn}
                    values={{
                      date: startDate,
                    }}
                  />
                )}
                <DatesSeparator>-</DatesSeparator>
                {pastPresentOrFuture(selectedPhase.attributes.end_at) ===
                'past' ? (
                  <FormattedMessage
                    {...messages.endedOn}
                    values={{
                      date: endDate,
                    }}
                  />
                ) : (
                  <FormattedMessage
                    {...messages.endsOn}
                    values={{
                      date: endDate,
                    }}
                  />
                )}
              </HeaderSubtitle>
            )}
            <ScreenReaderOnly>
              <FormattedMessage
                {...messages.a11y_selectedPhaseX}
                values={{
                  selectedPhaseNumber,
                  selectedPhaseTitle,
                }}
              />
            </ScreenReaderOnly>
          </HeaderTitleWrapper>
        </Left>

        <Right>
          <IdeaButton
            projectId={projectId}
            phaseId={selectedPhaseId}
            participationContextType="phase"
            fontWeight="500"
          />
        </Right>
      </Container>
    );
  }

  return null;
});

export default AboutHeader;
