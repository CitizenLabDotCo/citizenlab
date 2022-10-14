import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import moment from 'moment';

// hooks
import usePhase from 'hooks/usePhase';
import { useWindowSize } from '@citizenlab/cl2-component-library';
import useLocalize from 'hooks/useLocalize';

// i18n
import messages from 'containers/ProjectsShowPage/messages';
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
import { IPhaseData } from 'services/phases';

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

const HeaderTitle = styled.h2`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.l + 1}px;
  line-height: normal;
  font-weight: 600;
  margin: 0;
  padding: 0;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  &.present {
    color: ${colors.success};
  }
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
  const phase = usePhase(phaseId);
  const { windowWidth } = useWindowSize();
  const localize = useLocalize();
  const smallerThanSmallTablet = windowWidth <= viewportWidths.tablet;

  if (!isNilOrError(phase)) {
    let phaseTitle = localize(phase.attributes.title_multiloc);
    const phaseStatus = pastPresentOrFuture([
      phase.attributes.start_at,
      phase.attributes.end_at,
    ]);
    const { startDate, endDate } = getPhaseDates(phase);

    if (smallerThanSmallTablet && phaseTitle && phaseNumber) {
      phaseTitle = `${phaseNumber}. ${phaseTitle}`;
    }

    return (
      <Container
        className={className || ''}
        descriptionHasContent={descriptionHasContent}
      >
        <PhaseNumber aria-hidden className={phaseStatus}>
          {phaseNumber}
        </PhaseNumber>
        <HeaderTitleWrapper>
          <HeaderTitle className={`e2e-phase-title ${phaseStatus}`}>
            {phaseTitle || <FormattedMessage {...messages.noPhaseSelected} />}
          </HeaderTitle>
          <PhaseDate className={phaseStatus}>
            {startDate} - {endDate}
          </PhaseDate>
        </HeaderTitleWrapper>
      </Container>
    );
  }

  return null;
};

export default PhaseTitle;

function getPhaseDates(phase: IPhaseData) {
  const startMoment = moment(phase?.attributes.start_at, 'YYYY-MM-DD');
  const endMoment = moment(phase?.attributes.end_at, 'YYYY-MM-DD');
  const startDate = startMoment.format('LL');
  const endDate = endMoment.format('LL');

  return { startDate, endDate };
}
