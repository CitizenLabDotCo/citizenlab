import React from 'react';

import { Button } from '@citizenlab/cl2-component-library';
import moment from 'moment';
import { useTheme } from 'styled-components';

import useEvents from 'api/events/useEvents';
import { getCurrentPhase } from 'api/phases/utils';

import ParticipationCTAContent from 'components/ParticipationCTABars/ParticipationCTAContent';
import { CTABarProps } from 'components/ParticipationCTABars/utils';
import { EVENTS_WIDGET_ANCHOR_ID } from 'components/ProjectPageBuilder/Widgets/Events';
import useHasEventsWidget from 'components/ProjectPageBuilder/Widgets/Events/useHasEventsWidget';

import { FormattedMessage } from 'utils/cl-intl';
import { scrollToElement } from 'utils/scroll';

import messages from '../messages';

const EventsCTABar = ({ phases, project }: CTABarProps) => {
  const { data: events } = useEvents({
    projectIds: [project.id],
    currentAndFutureOnly: true,
    sort: 'start_at',
    ongoing_during: [
      moment(getCurrentPhase(phases)?.attributes.start_at).toString() || null,
      moment(getCurrentPhase(phases)?.attributes.end_at)
        .add(1, 'day')
        .toString() || null,
    ],
  });
  const theme = useTheme();
  const currentPhase = getCurrentPhase(phases);
  const hasEventsWidget = useHasEventsWidget(project.id);

  const showCTABar = !!events?.data.length && hasEventsWidget;

  if (!showCTABar) return null;

  return (
    <ParticipationCTAContent
      currentPhase={currentPhase}
      CTAButton={
        <Button
          id="e2e-cta-bar-see-events"
          onClick={() => scrollToElement({ id: EVENTS_WIDGET_ANCHOR_ID })}
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
