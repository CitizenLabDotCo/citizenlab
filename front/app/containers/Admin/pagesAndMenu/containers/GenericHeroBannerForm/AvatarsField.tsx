import React from 'react';
// components
import { SectionField, SubSectionTitle } from 'components/admin/Section';

import {
  Setting,
  ToggleLabel,
  StyledToggle,
  LabelContent,
  LabelTitle,
  LabelDescription,
} from 'containers/Admin/settings/general';
// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  checked: boolean;
  onChange: (bannerAvatarsEnabled: boolean) => void;
}

const AvatarsField = ({
  checked,
  onChange,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const handleOnChange = () => {
    onChange(!checked);
  };

  return (
    <SectionField key="avatars" data-cy="e2e-banner-avatar-toggle-section">
      <SubSectionTitle>
        <FormattedMessage {...messages.avatarsTitle} />
      </SubSectionTitle>
      <Setting>
        <ToggleLabel>
          <StyledToggle checked={checked} onChange={handleOnChange} />
          <LabelContent>
            <LabelTitle>
              {formatMessage(messages.bannerDisplayHeaderAvatars)}
            </LabelTitle>
            <LabelDescription>
              {formatMessage(messages.bannerDisplayHeaderAvatarsSubtitle)}
            </LabelDescription>
          </LabelContent>
        </ToggleLabel>
      </Setting>
    </SectionField>
  );
};

export default injectIntl(AvatarsField);
