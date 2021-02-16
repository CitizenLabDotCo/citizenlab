import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { indexOf } from 'lodash-es';
import moment from 'moment';

// hooks
import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'hooks/useAppConfiguration';
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
import {
  media,
  colors,
  fontSizes,
  viewportWidths,
  isRtl,
} from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';

const Container = styled.div`
  display: flex;
  align-items: center;

  ${isRtl`
    flex-direction: row-reverse;
  `}
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

  ${isRtl`
    margin-right: 0;
    margin-left: 11px;
  `}

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
  font-weight: 400;
`;

const HeaderTitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;

  ${isRtl`
    align-items: flex-end;
  `}
`;

const HeaderTitle = styled.h2`
  color: ${colors.label};
  font-size: ${fontSizes.large + 1}px;
  line-height: normal;
  font-weight: 600;
  margin: 0;
  padding: 0;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  &.present {
    color: ${colors.clGreen};
  }
`;

const HeaderSubtitle = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  line-height: normal;
  font-weight: 400;
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  margin-top: 4px;

  ${isRtl`
    flex-direction: row-reverse;
 `}
`;

interface Props {
  projectId: string;
  selectedPhaseId: string | null;
  className?: string;
}

const PhaseTitle = memo<Props>(({ projectId, selectedPhaseId, className }) => {
  const locale = useLocale();
  const tenant = useAppConfiguration();
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

    const startMoment = moment(
      selectedPhase?.attributes.start_at,
      'YYYY-MM-DD'
    );
    const endMoment = moment(selectedPhase?.attributes.end_at, 'YYYY-MM-DD');
    const startDate = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(startMoment.toDate());
    const endDate = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(endMoment.toDate());

    if (smallerThanSmallTablet && selectedPhaseTitle && selectedPhaseNumber) {
      selectedPhaseTitle = `${selectedPhaseNumber}. ${selectedPhaseTitle}`;
    }

    return (
      <Container className={className || ''}>
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
        <HeaderTitleWrapper>
          <HeaderTitle
            aria-hidden
            className={`e2e-phase-title ${
              isSelected && 'selected'
            } ${selectedPhaseStatus}`}
          >
            {selectedPhaseTitle || (
              <FormattedMessage {...messages.noPhaseSelected} />
            )}
          </HeaderTitle>
          <HeaderSubtitle className={selectedPhaseStatus || ''}>
            {startDate} - {endDate}
          </HeaderSubtitle>
        </HeaderTitleWrapper>
        <ScreenReaderOnly>
          <FormattedMessage
            {...messages.a11y_selectedPhaseX}
            values={{
              selectedPhaseNumber,
              selectedPhaseTitle,
            }}
          />
        </ScreenReaderOnly>
      </Container>
    );
  }

  return null;
});

export default PhaseTitle;
