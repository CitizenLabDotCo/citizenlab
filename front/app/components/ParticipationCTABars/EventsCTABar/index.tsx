import React from 'react';

// components
import { Button } from '@citizenlab/cl2-component-library';
import { ParticipationCTAContent } from 'components/ParticipationCTABars/ParticipationCTAContent';

// hooks
import { useTheme } from 'styled-components';
import useEvents from 'api/events/useEvents';

// utils
import { CTABarProps } from 'components/ParticipationCTABars/utils';
import { getCurrentPhase } from 'api/phases/utils';
import { scrollToElement } from 'utils/scroll';
import moment from 'moment';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

export const EventsCTABar = ({ phases, project }: CTABarProps) => {
  const projectType = project?.attributes.process_type;
  const { data: events } = useEvents({
    projectIds: [project.id],
    currentAndFutureOnly: true,
    sort: 'start_at',
    ongoing_during:
      projectType === 'timeline'
        ? [
            moment(getCurrentPhase(phases)?.attributes.start_at).toString() ||
              null,
            moment(getCurrentPhase(phases)?.attributes.end_at)
              .add(1, 'day')
              .toString() || null,
          ]
        : undefined,
  });
  const theme = useTheme();
  const currentPhase = getCurrentPhase(phases);

  const showCTABar = !!events?.data.length;

  if (!showCTABar) return null;

  return (
    <ParticipationCTAContent
      currentPhase={currentPhase}
      project={project}
      CTAButton={
        <Button
          id="e2e-cta-bar-see-events"
          onClick={() => scrollToElement({ id: 'project-events' })}
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
