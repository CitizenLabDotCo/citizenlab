// "Personal info": the name we ask for. Only meaningful when participation
// requires an account.

import React from 'react';

import { IPermissionData } from 'api/permissions/types';

import { useIntl } from 'utils/cl-intl';

import actionFormMessages from '../../messages';
import { Changes } from '../../types';
import { Expander } from '../../ui';

import messages from './messages';
import PiiToggle from './PiiToggle';

interface Props {
  permission: IPermissionData;
  onChange: (changes: Changes) => void;
}

const PersonalInfoSection = ({ permission, onChange }: Props) => {
  const { attributes } = permission;
  const { formatMessage } = useIntl();

  return (
    <Expander
      dataCy="e2e-personal-info-section"
      icon="user-circle"
      title={formatMessage(messages.personalInfo)}
      summary={formatMessage(
        attributes.require_name
          ? actionFormMessages.name
          : messages.nothingExtra
      )}
    >
      <PiiToggle
        dataCy="e2e-require-name-toggle"
        icon="user-circle"
        title={formatMessage(messages.fullName)}
        description={formatMessage(messages.fullNameDescription)}
        checked={attributes.require_name}
        onChange={() => onChange({ require_name: !attributes.require_name })}
      />
    </Expander>
  );
};

export default PersonalInfoSection;
