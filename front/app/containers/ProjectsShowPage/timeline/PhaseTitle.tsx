import React from 'react';

import {
  useWindowSize,
  media,
  colors,
  fontSizes,
  viewportWidths,
  isRtl,
  Title,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import usePhase from 'api/phases/usePhase';

import useLocalize from 'hooks/useLocalize';

import messages from 'containers/ProjectsShowPage/messages';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { getLocalisedDateString, pastPresentOrFuture } from 'utils/dateUtils';

const Container = styled.div<{ descriptionHasContent: boolean }>`
  display: flex;
  align-items: center;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  margin-bottom: ${(props) => (props.descriptionHasContent ? '30px' : '0px')};
`;

const PhaseNumber = styled.div`
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 39px;
  width: 39px;
  height: 39px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${colors.textSecondary};
  margin-right: 11px;
  color: #fff;
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;

  ${isRtl`
    margin-right: 0;
    margin-left: 11px;
  `}

  &.present {
    background: ${colors.success};
  }

  ${media.phone`
    display: none;
  `}
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

const PhaseDate = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  margin-top: 5px;

  ${isRtl`
    flex-direction: row-reverse;
 `}
`;

interface Props {
  phaseId: string | null;
  phaseNumber: number | null;
  className?: string;
  descriptionHasContent: boolean;
}

const PhaseTitle = ({
  phaseId,
  phaseNumber,
  className,
  descriptionHasContent,
}: Props) => {
  const { data: phase } = usePhase(phaseId);
  const { windowWidth } = useWindowSize();
  const localize = useLocalize();
  const smallerThanSmallTablet = windowWidth <= viewportWidths.tablet;
  const { formatMessage } = useIntl();

  if (phase) {
    let phaseTitle = localize(phase.data.attributes.title_multiloc);
    const phaseStatus = pastPresentOrFuture([
      phase.data.attributes.start_at,
      phase.data.attributes.end_at,
    ]);
    const startDate = getLocalisedDateString(phase.data.attributes.start_at);
    const endDate = phase.data.attributes.end_at
      ? getLocalisedDateString(phase.data.attributes.end_at)
      : formatMessage(messages.noEndDate);

    if (smallerThanSmallTablet && phaseTitle && phaseNumber) {
      phaseTitle = `${phaseNumber}. ${phaseTitle}`;
    }

    const isOneDayPhase = startDate === endDate;

    return (
      <Container
        className={className || ''}
        descriptionHasContent={descriptionHasContent}
      >
        <PhaseNumber aria-hidden className={phaseStatus}>
          {phaseNumber}
        </PhaseNumber>
        <HeaderTitleWrapper>
          <Title
            variant="h3"
            className={`e2e-phase-title ${phaseStatus}`}
            m="0"
            color={phaseStatus === 'present' ? 'success' : 'textSecondary'}
          >
            {phaseTitle || <FormattedMessage {...messages.noPhaseSelected} />}
          </Title>
          <PhaseDate className={phaseStatus}>
            {isOneDayPhase ? startDate : `${startDate} - ${endDate}`}
          </PhaseDate>
        </HeaderTitleWrapper>
      </Container>
    );
  }

  return null;
};

export default PhaseTitle;
