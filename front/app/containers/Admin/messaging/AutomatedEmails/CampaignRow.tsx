import React from 'react';

import {
  Toggle,
  Box,
  ListItem,
  Tooltip,
} from '@citizenlab/cl2-component-library';

import { CampaignContext } from 'api/campaigns/types';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import UpsellTooltip from 'components/UpsellTooltip';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { useLocation } from 'utils/router';

import messages from '../messages';

import CampaignDescription from './CampaignDescription';
import { CampaignData } from './types';
import useCampaignRow from './useCampaignRow';

type Props = {
  campaign: CampaignData;
  context?: CampaignContext;
  onClickViewExample?: () => void;
};

const CampaignRow = ({ campaign, context, onClickViewExample }: Props) => {
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const {
    toggleEnabled,
    openEditor,
    isComingSoon,
    isOutsidePlan,
    isEditable,
    canBeDisabled,
  } = useCampaignRow({
    campaign,
    context,
    editPath: (campaignId) => `${pathname}/${campaignId}/edit`,
  });

  const renderTooltip = (children) => {
    if (isOutsidePlan) {
      return <UpsellTooltip disabled={false}>{children}</UpsellTooltip>;
    }
    return (
      <Tooltip
        disabled={!isComingSoon}
        content={formatMessage(messages.editDisabledTooltip)}
      >
        {children}
      </Tooltip>
    );
  };

  return (
    <ListItem p="8px 0">
      <Box display="flex" alignItems="center">
        <Toggle
          checked={!!campaign.attributes.enabled}
          onChange={toggleEnabled}
          disabled={!canBeDisabled}
        />
        <CampaignDescription campaign={campaign} />
        <Box display="flex" justifyContent="flex-end" flexGrow={1}>
          {onClickViewExample && (
            <Box>
              <ButtonWithLink
                icon="eye"
                onClick={onClickViewExample}
                buttonStyle="secondary-outlined"
              >
                <FormattedMessage {...messages.viewExample} />
              </ButtonWithLink>
            </Box>
          )}
          <Box ml="12px">
            {renderTooltip(
              <ButtonWithLink
                icon="edit"
                onClick={openEditor}
                disabled={!isEditable}
                buttonStyle="secondary-outlined"
              >
                <FormattedMessage {...messages.editButtonLabel} />
              </ButtonWithLink>
            )}
          </Box>
        </Box>
      </Box>
    </ListItem>
  );
};

export default CampaignRow;
