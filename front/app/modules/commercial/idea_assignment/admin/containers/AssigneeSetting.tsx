import React from 'react';

import SettingsSection from 'components/UI/SettingsModal/SettingsSection';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import AssigneeSelector from '../components/AssigneeSelector';

import messages from './messages';

interface Props {
  projectId: string;
}

const AssigneeSetting = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <SettingsSection
      title={formatMessage(messages.inputAssignmentSectionTitle)}
      tooltip={
        <FormattedMessage
          {...messages.inputAssignmentTooltipText}
          values={{
            globalInputManagerLink: (
              <Link to="/admin/ideas">
                <FormattedMessage {...messages.globalInputManagerLinkText} />
              </Link>
            ),
          }}
        />
      }
    >
      <AssigneeSelector projectId={projectId} variant="bo" />
    </SettingsSection>
  );
};

export default AssigneeSetting;
