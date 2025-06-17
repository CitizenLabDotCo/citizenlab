import React, { useEffect, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useLocation } from 'react-router-dom';
import { useTheme } from 'styled-components';

import { IPhaseData } from 'api/phases/types';
import { getCurrentPhase, getLastPhase } from 'api/phases/utils';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import { scrollTo } from 'containers/Authentication/SuccessActions/actions/scrollTo';

import ParticipationCTAContent from 'components/ParticipationCTABars/ParticipationCTAContent';
import {
  CTABarProps,
  hasProjectEndedOrIsArchived,
} from 'components/ParticipationCTABars/utils';
import Button from 'components/UI/ButtonWithLink';

import { isFixableByAuthentication } from 'utils/actionDescriptors';
import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

const CommonGroundCTABar = ({ phases, project }: CTABarProps) => {
  const theme = useTheme();
  const [currentPhase, setCurrentPhase] = useState<IPhaseData | undefined>();
  const { pathname, hash: divId } = useLocation();

  useEffect(() => {
    setCurrentPhase(getCurrentPhase(phases) || getLastPhase(phases));
  }, [phases]);

  useEffect(() => {
    const element = document.getElementById(divId);
    if (element) {
      element.scrollIntoView();
    }
  }, [divId]);

  const { enabled: reactingEnabled, disabled_reason: reactingDisabledReason } =
    project.attributes.action_descriptors.reacting_idea;
  const { enabled: postingEnabled } =
    project.attributes.action_descriptors.posting_idea;
  const showSignIn =
    reactingEnabled || isFixableByAuthentication(reactingDisabledReason);

  if (!currentPhase || hasProjectEndedOrIsArchived(project, currentPhase)) {
    return null;
  }

  const handleReactToInputs = () => {
    const scrollToParams = {
      elementId: 'common-ground-tabs',
      pathname,
      projectSlug: project.attributes.slug,
      currentPhase,
    };

    if (reactingEnabled) {
      scrollTo(scrollToParams)();
      return;
    }

    if (isFixableByAuthentication(reactingDisabledReason)) {
      const successAction: SuccessAction = {
        name: 'scrollTo',
        params: scrollToParams,
      };

      triggerAuthenticationFlow({
        context: {
          type: 'phase',
          action: 'taking_survey',
          id: currentPhase.id,
        },
        successAction,
      });
    }
  };

  return (
    <ParticipationCTAContent
      currentPhase={currentPhase}
      CTAButton={
        showSignIn ? (
          <Box display="flex" gap="8px">
            {/* We only want to show one button in the CTA */}
            {postingEnabled ? (
              <Button
                fontWeight="500"
                bgColor={theme.colors.white}
                textColor={theme.colors.tenantText}
                textHoverColor={theme.colors.black}
                padding="6px 12px"
                fontSize="14px"
                linkTo={`/projects/${project.attributes.slug}/ideas/new?phase_id=${currentPhase.id}`}
              >
                <FormattedMessage {...messages.addInput} />
              </Button>
            ) : (
              <Button
                onClick={handleReactToInputs}
                fontWeight="500"
                bgColor={theme.colors.white}
                textColor={theme.colors.tenantText}
                textHoverColor={theme.colors.black}
                padding="6px 12px"
                fontSize="14px"
              >
                <FormattedMessage {...messages.viewInputs} />
              </Button>
            )}
          </Box>
        ) : null
      }
    />
  );
};

export default CommonGroundCTABar;
