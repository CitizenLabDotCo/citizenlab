import React from 'react';

// messages
import messages from '../../messages';

// typings
import { ITextingCampaignStatuses } from 'services/textingCampaigns';

// components
import { StatusLabel } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';

// styling
import { colors } from 'utils/styleUtils';

interface FormattedStatusLabelProps {
  campaignStatus: ITextingCampaignStatuses;
}

const FormattedStatusLabel = (
  props: FormattedStatusLabelProps
): JSX.Element | null => {
  switch (props.campaignStatus) {
    case 'draft':
      return (
        <StatusLabel
          width="100%"
          backgroundColor={colors.adminOrangeIcons}
          text={<FormattedMessage {...messages.draft} />}
        />
      );
    case 'sending':
      return (
        <StatusLabel
          width="100%"
          backgroundColor={colors.adminMenuBackground}
          text={<FormattedMessage {...messages.sending} />}
        />
      );
    case 'sent':
      return (
        <StatusLabel
          width="100%"
          backgroundColor={colors.clGreenSuccess}
          text={<FormattedMessage {...messages.sent} />}
        />
      );
    case 'failed':
      return (
        <StatusLabel
          width="100%"
          backgroundColor={colors.clRedError}
          text={<FormattedMessage {...messages.failed} />}
        />
      );
    default:
      return null;
  }
};

export default FormattedStatusLabel;
