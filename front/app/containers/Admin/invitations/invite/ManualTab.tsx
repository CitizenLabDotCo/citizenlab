import React from 'react';
import { Label } from '@citizenlab/cl2-component-library';
import { SectionField } from 'components/admin/Section';
import { FormattedMessage } from 'utils/cl-intl';
import TextArea from 'components/UI/TextArea';
import messages from '../messages';

interface Props {
  selectedEmails: string | null;
  handleEmailListOnChange: (selectedEmails: string) => void;
}

const ManualTab = ({ selectedEmails, handleEmailListOnChange }: Props) => {
  return (
    <SectionField>
      <Label htmlFor="e2e-emails">
        <FormattedMessage {...messages.emailListLabel} />
      </Label>
      <TextArea
        value={selectedEmails || ''}
        onChange={handleEmailListOnChange}
        id="e2e-emails"
      />
    </SectionField>
  );
};

export default ManualTab;
