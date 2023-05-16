import React, { useEffect, useState, useCallback, FormEvent } from 'react';

// Components
import { Button } from '@citizenlab/cl2-component-library';
import { ParticipationCTAContent } from 'components/ParticipationCTABars/ParticipationCTAContent';

// hooks
import { useTheme } from 'styled-components';

// services
import { IPhaseData } from 'api/phases/types';
import { getCurrentPhase, getLastPhase } from 'api/phases/utils';

// utils
import { scrollToElement } from 'utils/scroll';
import {
  CTABarProps,
  hasProjectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// router
import clHistory from 'utils/cl-router/history';
import { useLocation } from 'react-router-dom';

import { selectPhase } from 'containers/ProjectsShowPage/timeline/events';

export const DocumentAnnotationCTABar = ({ phases, project }: CTABarProps) => {
  const theme = useTheme();
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | undefined>();
  const { pathname } = useLocation();

  useEffect(() => {
    setCurrentPhase(getCurrentPhase(phases) || getLastPhase(phases));
  }, [phases]);

  const scrollTo = useCallback(
    (id: string, shouldSelectCurrentPhase = true) =>
      (event: FormEvent) => {
        event.preventDefault();
        const isOnProjectPage = pathname.endsWith(
          `/projects/${project.attributes.slug}`
        );

        currentPhase && shouldSelectCurrentPhase && selectPhase(currentPhase);

        if (isOnProjectPage) {
          scrollToElement({ id, shouldFocus: true });
        } else {
          clHistory.push(`/projects/${project.attributes.slug}#${id}`);
        }
      },
    [currentPhase, project, pathname]
  );

  const handleTakeSurveyClick = (event: FormEvent) => {
    scrollTo('project-survey')(event);
  };

  if (hasProjectEndedOrIsArchived(project, currentPhase)) {
    return null;
  }

  const CTAButton = (
    <Button
      id="e2e-take-survey-button"
      buttonStyle="primary"
      onClick={handleTakeSurveyClick}
      fontWeight="500"
      bgColor={theme.colors.white}
      textColor={theme.colors.tenantText}
      textHoverColor={theme.colors.black}
      padding="6px 12px"
      fontSize="14px"
    >
      <FormattedMessage {...messages.takeTheSurvey} />
    </Button>
  );

  return (
    <ParticipationCTAContent
      currentPhase={currentPhase}
      CTAButton={CTAButton}
    />
  );
};

// TO DO: add auth?
// Check front/app/components/ParticipationCTABars/EmbeddedSurveyCTABar/index.tsx as reference.
