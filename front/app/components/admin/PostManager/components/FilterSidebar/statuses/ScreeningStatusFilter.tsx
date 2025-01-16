import React from 'react';

import { IconTooltip, Box, Tooltip } from '@citizenlab/cl2-component-library';
import ColorIndicator from 'component-library/components/ColorIndicator';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import usePhase from 'api/phases/usePhase';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { ManagerType } from 'components/admin/PostManager';
import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../../messages';

import StatusButton from './StatusButton';

const StatusText = styled.div`
  &:first-letter {
    text-transform: uppercase;
  }
`;

interface Props {
  status: IIdeaStatusData;
  active: boolean;
  onClick: () => void;
  type: ManagerType;
}

const ScreeningStatusFilter = ({ status, active, onClick, type }: Props) => {
  const { phaseId } = useParams();
  const { data: phase } = usePhase(phaseId);

  const preScreeningFeatureFlag =
    phase?.data.attributes.participation_method === 'ideation'
      ? 'prescreening_ideation'
      : 'prescreening';

  const preScreeningFeatureAllowed = useFeatureFlag({
    name: preScreeningFeatureFlag,
    onlyCheckAllowed: true,
  });
  const prescreeningIdeationFeatureEnabled = useFeatureFlag({
    name: 'prescreening_ideation',
  });
  const prescreeningProposalsFeatureEnabled = useFeatureFlag({
    name: 'prescreening',
  });

  const phaseSettingEnabled =
    phase?.data.attributes.prescreening_enabled === true;
  const statusFilterIsEnabled = type === 'AllIdeas' || phaseSettingEnabled;
  const showPhaseSettingIsDisabledTooltip =
    ((type === 'ProjectIdeas' && prescreeningIdeationFeatureEnabled) ||
      (type === 'ProjectProposals' && prescreeningProposalsFeatureEnabled)) &&
    !phaseSettingEnabled;
  const showPrescreeningUpsellTooltip = !preScreeningFeatureAllowed;
  const tooltipEnabled =
    showPhaseSettingIsDisabledTooltip || showPrescreeningUpsellTooltip;

  return (
    // Div wrapping is needed to make the filter take full width.
    <div>
      <Tooltip
        content={
          /*
            We can't have both tooltips at the same time: if the upsell tooltip is shown,
            the phase setting tooltip should not be shown.
            The feature needs to be allowed before the phase setting is even visible.
          */
          <div>
            {showPrescreeningUpsellTooltip && (
              <FormattedMessage {...messages.prescreeningTooltipUpsell} />
            )}
            {showPhaseSettingIsDisabledTooltip && (
              <FormattedMessage
                {...messages.prescreeningTooltipPhaseDisabled}
              />
            )}
          </div>
        }
        disabled={!tooltipEnabled}
      >
        <Box>
          <StatusButton
            onClick={onClick}
            active={active}
            disabled={!statusFilterIsEnabled}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="flex-start"
              w="100%"
            >
              <ColorIndicator bgColor={status.attributes.color} />
              <Box display="flex" alignItems="center" gap="4px">
                <StatusText>
                  <T value={status.attributes.title_multiloc} />
                </StatusText>
                {statusFilterIsEnabled && (
                  <IconTooltip
                    theme="light"
                    iconSize="16px"
                    content={
                      <FormattedMessage
                        {...messages.automatedStatusTooltipText}
                      />
                    }
                  />
                )}
              </Box>
            </Box>
          </StatusButton>
        </Box>
      </Tooltip>
    </div>
  );
};

export default ScreeningStatusFilter;
