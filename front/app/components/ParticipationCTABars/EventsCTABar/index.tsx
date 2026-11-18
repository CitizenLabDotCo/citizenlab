import React from 'react';

import { Button } from '@citizenlab/cl2-component-library';
import moment from 'moment';
import { useTheme } from 'styled-components';

import useEvents from 'api/events/useEvents';

import { EVENTS_WIDGET_ANCHOR_ID } from 'components/admin/ContentBuilder/Widgets/Events';
import ParticipationCTAContent from 'components/ParticipationCTABars/ParticipationCTAContent';
import {
  CTABarProps,
  getCTAPhase,
} from 'components/ParticipationCTABars/utils';
import useHasEventsWidget from 'components/ProjectPageBuilder/Widgets/Events/useHasEventsWidget';

import { FormattedMessage } from 'utils/cl-intl';
import { getPreviewEventsPeriod } from 'utils/phasePreview/events';
import { usePhasePreview } from 'utils/phasePreview/runtime';
import { scrollToElement } from 'utils/scroll';

import messages from '../messages';

const EventsCTABar = ({ phases, project }: CTABarProps) => {
  const preview = usePhasePreview();
  const currentPhase = getCTAPhase(phases);
  const { data: events } = useEvents({
    projectIds: [project.id],
    sort: 'start_at',
    ...(preview
      ? getPreviewEventsPeriod(preview)
      : {
          currentAndFutureOnly: true,
          ongoing_during: [
            moment(currentPhase?.attributes.start_at).toString() || null,
            moment(currentPhase?.attributes.end_at).add(1, 'day').toString() ||
              null,
          ],
        }),
  });
  const theme = useTheme();
  const hasEventsWidget = useHasEventsWidget(project.id);

  const showCTABar = !!events?.data.length && (!!preview || hasEventsWidget);

  if (!showCTABar) return null;

  return (
    <ParticipationCTAContent
      currentPhase={currentPhase}
      CTAButton={
        <Button
          id="e2e-cta-bar-see-events"
          onClick={() =>
            scrollToElement({
              id: preview ? 'e2e-event-previews' : EVENTS_WIDGET_ANCHOR_ID,
            })
          }
          fontWeight="500"
          bgColor={theme.colors.white}
          textColor={theme.colors.tenantText}
          textHoverColor={theme.colors.black}
          padding="6px 12px"
          fontSize="14px"
        >
          <FormattedMessage {...messages.seeEvents} />
        </Button>
      }
    />
  );
};

export default EventsCTABar;
