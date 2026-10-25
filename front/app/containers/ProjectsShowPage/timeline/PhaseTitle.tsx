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
import { FormattedTime } from 'react-intl';
import styled from 'styled-components';

import usePhase from 'api/phases/usePhase';

import useLocalize from 'hooks/useLocalize';

import messages from 'containers/ProjectsShowPage/messages';

import previewMessages from 'components/admin/PhasePreview/messages';
import SkeletonBar from 'components/ProjectPageBuilder/Widgets/EmptyState/SkeletonBar';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import {
  getIsoDate,
  getLocalisedDateString,
  pastPresentOrFuture,
} from 'utils/dateUtils';
import { getPhasePreview } from 'utils/phasePreview/runtime';

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
    const preview = getPhasePreview();
    const dates = preview
      ? { ...preview.phase.attributes, ...preview.draft }
      : phase.data.attributes;
    const startDate = dates.start_at
      ? getLocalisedDateString(
          getPhasePreview() ? getIsoDate(dates.start_at) : dates.start_at
        )
      : undefined;
    const endDate = dates.end_at
      ? getLocalisedDateString(
          getPhasePreview() ? getIsoDate(dates.end_at) : dates.end_at
        )
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
            id={getPhasePreview() ? 'phase-preview-title' : undefined}
            variant="h3"
            className={`e2e-phase-title ${phaseStatus}`}
            m="0"
            color={
              getPhasePreview()
                ? 'tenantText'
                : phaseStatus === 'present'
                ? 'success'
                : 'textSecondary'
            }
          >
            {phaseTitle ||
              (getPhasePreview() ? (
                <SkeletonBar width="200px" height="22px" />
              ) : (
                <FormattedMessage {...messages.noPhaseSelected} />
              ))}
          </Title>
          <PhaseDate className={phaseStatus}>
            {!startDate && getPhasePreview() ? (
              <SkeletonBar width="150px" />
            ) : !startDate ? (
              <FormattedMessage {...previewMessages.noDates} />
            ) : isOneDayPhase ? (
              startDate
            ) : (
              <>
                {startDate}
                <>
                  {' '}
                  <FormattedTime value={dates.start_at} />
                </>
                {' - '}
                {endDate}
                {dates.end_at && (
                  <>
                    {' '}
                    <FormattedTime value={dates.end_at} />
                  </>
                )}
              </>
            )}
          </PhaseDate>
        </HeaderTitleWrapper>
      </Container>
    );
  }

  return null;
};

export default PhaseTitle;
