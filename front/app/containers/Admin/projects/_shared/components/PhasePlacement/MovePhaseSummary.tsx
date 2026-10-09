import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';

import useLocalize from 'hooks/useLocalize';

import Error from 'components/UI/Error';
import Warning from 'components/UI/Warning';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import messages from './messages';
import { PhasePlacementMove } from './usePhasePlacementMove';

interface Props {
  phase: IPhaseData;
  placementMove: PhasePlacementMove;
}

const MovePhaseSummary = ({ phase, placementMove }: Props) => {
  const { formatMessage, formatDate } = useIntl();
  const localize = useLocalize();
  const {
    onTimeline,
    toTimelineCheck,
    toSpotlightCheck,
    blocked,
    shownOnProjectPage,
    errors,
  } = placementMove;
  const { start_at, end_at } = phase.attributes;
  const longDate = (date: string) => formatDate(date, { dateStyle: 'long' });

  const notices: string[] = [];
  const addNotice = (
    message: MessageDescriptor,
    values?: Record<string, string>
  ) => notices.push(formatMessage(message, values));

  if (toTimelineCheck) {
    if (shownOnProjectPage) addNotice(messages.widgetRemoved);
    if (toTimelineCheck.phaseToClose) {
      addNotice(messages.previousPhaseEnds, {
        phaseName: localize(
          toTimelineCheck.phaseToClose.attributes.title_multiloc
        ),
        date: longDate(start_at),
      });
    }
    if (toTimelineCheck.renumbersLaterPhases) {
      addNotice(messages.laterPhasesRenumbered);
    }
  }

  if (toSpotlightCheck) {
    addNotice(messages.timelinePageRemoved);
    if (toSpotlightCheck.renumbersLaterPhases) {
      addNotice(messages.laterPhasesRenumbered);
    }
    if (toSpotlightCheck.leavesGap && end_at) {
      addNotice(messages.timelineGap, {
        from: longDate(start_at),
        to: longDate(end_at),
      });
    }
    const { newLastPhase } = toSpotlightCheck;
    if (newLastPhase?.attributes.end_at) {
      addNotice(messages.newLastPhase, {
        phaseName: localize(newLastPhase.attributes.title_multiloc),
        date: longDate(newLastPhase.attributes.end_at),
      });
    }
    if (toSpotlightCheck.ended) addNotice(messages.endedSurveyHidden);
  }

  return (
    <Box display="flex" flexDirection="column" gap="12px">
      <Text m="0">
        {formatMessage(
          onTimeline
            ? messages.moveToSpotlightSurveysExplanation
            : messages.moveToTimelineExplanation
        )}
      </Text>

      {blocked && toTimelineCheck ? (
        <Box>
          {toTimelineCheck.overlappingPhases.map((other) => (
            <Error
              key={other.id}
              marginTop="0"
              text={formatMessage(messages.overlapBlocker, {
                phaseName: localize(other.attributes.title_multiloc),
              })}
            />
          ))}
          {toTimelineCheck.openEndedNotLast && (
            <Error
              marginTop="0"
              text={formatMessage(messages.openEndedBlocker)}
            />
          )}
          <Text m="8px 0 0 0">{formatMessage(messages.changeDatesHint)}</Text>
        </Box>
      ) : (
        notices.length > 0 && (
          <Warning>
            <Box as="ul" m="0" pl="20px">
              {notices.map((notice) => (
                <Text as="li" m="0" key={notice}>
                  {notice}
                </Text>
              ))}
            </Box>
          </Warning>
        )
      )}

      {errors && (
        <Box>
          <Error apiErrors={errors.base} />
          <Error apiErrors={errors.participation_method} />
          <Error apiErrors={errors.end_at} />
          {'previous_phase' in errors && (
            <Error text={formatMessage(messages.previousPhaseError)} />
          )}
        </Box>
      )}
    </Box>
  );
};

export default MovePhaseSummary;
