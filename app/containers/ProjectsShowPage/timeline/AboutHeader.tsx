import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { indexOf } from 'lodash-es';
import bowser from 'bowser';
import moment from 'moment';

// hooks
import useLocale from 'hooks/useLocale';
import useTenant from 'hooks/useTenant';
import usePhases from 'hooks/usePhases';
import useWindowSize from 'hooks/useWindowSize';

// i18n
import messages from 'containers/ProjectsShowPage/messages';
import { getLocalized } from 'utils/i18n';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { pastPresentOrFuture } from 'utils/dateUtils';

// style
import styled from 'styled-components';
import { media, colors, fontSizes, viewportWidths } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';

const Container = styled.div<{ bottomMargin: string }>`
  display: flex;
  align-items: center;
  margin-bottom: ${(props) => props.bottomMargin};
`;

const PhaseNumberWrapper = styled.div`
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 39px;
  width: 39px;
  height: 39px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${colors.label};
  margin-right: 11px;

  &.present {
    background: ${colors.clGreen};
  }

  ${media.smallerThanMinTablet`
    display: none;
  `}
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
  color: ${colors.label};
  font-size: ${fontSizes.large + 2}px;
  line-height: normal;
  font-weight: 600;
  margin: 0;
  margin-bottom: 3px;
  padding: 0;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  &.present {
    color: ${colors.clGreen};
  }

  ${media.smallerThanMinTablet`
    font-size: ${fontSizes.large}px;
    display: flex;
    align-items: center;
  `}
`;

const HeaderSubtitle = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base - 1}px;
  line-height: normal;
  font-weight: 400;
  display: flex;
  align-items: center;

  &.present {
    color: ${colors.clGreen};
  }
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
  const { windowWidth } = useWindowSize();

  const smallerThanSmallTablet = windowWidth <= viewportWidths.smallTablet;

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
    let selectedPhaseTitle = selectedPhase
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
    const selectedPhaseStatus =
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

    if (smallerThanSmallTablet && selectedPhaseTitle && selectedPhaseNumber) {
      selectedPhaseTitle = `${selectedPhaseNumber}. ${selectedPhaseTitle}`;
    }

    return (
      <Container
        className={className || ''}
        bottomMargin={phases.length > 1 ? '30px' : '15px'}
      >
        {isSelected && phases.length > 1 && (
          <PhaseNumberWrapper
            aria-hidden
            className={`${isSelected && 'selected'} ${selectedPhaseStatus}`}
          >
            <PhaseNumber
              className={`${isSelected && 'selected'} ${selectedPhaseStatus}`}
            >
              {selectedPhaseNumber}
            </PhaseNumber>
          </PhaseNumberWrapper>
        )}

        <HeaderTitleWrapper className={bowser.msie ? 'ie' : ''}>
          <HeaderTitle
            aria-hidden
            className={`${isSelected && 'selected'} ${selectedPhaseStatus}`}
          >
            {selectedPhaseTitle || (
              <FormattedMessage {...messages.noPhaseSelected} />
            )}
          </HeaderTitle>
          {selectedPhase && phases.length > 1 && (
            <HeaderSubtitle className={selectedPhaseStatus || ''}>
              {selectedPhaseStatus === 'past' && (
                <FormattedMessage
                  {...messages.endedOn}
                  values={{ date: endDate }}
                />
              )}
              {selectedPhaseStatus === 'present' && (
                <FormattedMessage
                  {...messages.endsOn}
                  values={{ date: endDate }}
                />
              )}
              {selectedPhaseStatus === 'future' && (
                <FormattedMessage
                  {...messages.startsOn}
                  values={{ date: startDate }}
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
      </Container>
    );
  }

  return null;
});

export default AboutHeader;
