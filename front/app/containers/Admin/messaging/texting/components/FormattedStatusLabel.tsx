import React from 'react';

// messages
import messages from '../../messages';

// typings
import { TTextingCampaignStatus } from 'services/textingCampaigns';

// components
import { StatusLabel } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';

// styling
import { colors } from 'utils/styleUtils';

interface FormattedStatusLabelProps {
  width?: string;
  campaignStatus: TTextingCampaignStatus;
}

const FormattedStatusLabel = (
  props: FormattedStatusLabelProps
): JSX.Element | null => {
  switch (props.campaignStatus) {
    case 'draft':
      return (
        <StatusLabel
          width={props.width}
          backgroundColor={colors.orange}
          text={<FormattedMessage {...messages.draft} />}
        />
      );
    case 'sending':
      return (
        <StatusLabel
          width={props.width}
          backgroundColor={colors.background}
          text={<FormattedMessage {...messages.sending} />}
        />
      );
    case 'sent':
      return (
        <StatusLabel
          width={props.width}
          backgroundColor={colors.success}
          text={<FormattedMessage {...messages.sent} />}
        />
      );
    case 'failed':
      return (
        <StatusLabel
          width={props.width}
          backgroundColor={colors.red600}
          text={<FormattedMessage {...messages.failed} />}
        />
      );
    default:
      return null;
  }
};

export default FormattedStatusLabel;
