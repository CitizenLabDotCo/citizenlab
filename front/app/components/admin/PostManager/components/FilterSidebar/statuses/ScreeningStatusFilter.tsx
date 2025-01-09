import React from 'react';

import { IconTooltip, Box, Tooltip } from '@citizenlab/cl2-component-library';
import ColorIndicator from 'component-library/components/ColorIndicator';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import usePhase from 'api/phases/usePhase';

import useFeatureFlag from 'hooks/useFeatureFlag';

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
}

const ScreeningStatusFilter = ({ status, active, onClick }: Props) => {
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
  const phasePrescreeningEnabled =
    phase?.data.attributes.prescreening_enabled === true;

  const prescreeningButtonIsDisabled =
    !phasePrescreeningEnabled || !preScreeningFeatureAllowed;

  const prescreeningTooltipIsDisabled =
    phasePrescreeningEnabled && preScreeningFeatureAllowed;

  return (
    // Div wrapping is needed to make the filter take full width.
    <div>
      <Tooltip
        content={
          <div>
            {!preScreeningFeatureAllowed ? (
              <FormattedMessage {...messages.prescreeningTooltipUpsell} />
            ) : (
              <FormattedMessage
                {...messages.prescreeningTooltipPhaseDisabled}
              />
            )}
          </div>
        }
        disabled={prescreeningTooltipIsDisabled}
      >
        <Box>
          <StatusButton
            onClick={onClick}
            active={active}
            disabled={prescreeningButtonIsDisabled}
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
                <IconTooltip
                  theme="light"
                  iconSize="16px"
                  content={
                    <FormattedMessage
                      {...messages.automatedStatusTooltipText}
                    />
                  }
                />
              </Box>
            </Box>
          </StatusButton>
        </Box>
      </Tooltip>
    </div>
  );
};

export default ScreeningStatusFilter;
