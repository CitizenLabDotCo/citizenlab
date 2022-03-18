import React from 'react';

// components
import TextArea from 'components/UI/TextArea';
import { Label } from '@citizenlab/cl2-component-library';
import { Section, SectionField } from 'components/admin/Section';
import HelmetIntl from 'components/HelmetIntl';
import TextingHeader from './TextingHeader';

// i18n
// import { InjectedIntlProps } from 'react-intl';
// import { FormattedMessage } from 'utils/cl-intl';
// import messages from '../messages';
// import { API_PATH, appLocalePairs } from 'containers/App/constants';
// import { getLocalized } from 'utils/i18n';

const TextCreation = () => {
  return (
    <>
      <HelmetIntl
        title={{ id: 'test', defaultMessage: 'Create new SMS' }}
        description={{
          id: 'test',
          defaultMessage: 'View sent SMS',
        }}
      />
      <Section>
        <SectionField>
          <TextingHeader
            headerMessage="View sent message"
            onClickGoBack={() => {}}
          />
          <p>Sent March 10 2022 to 2019 recipients.</p>
        </SectionField>
        <SectionField>
          <Label>To:</Label>
          <TextArea
            key="testkeykey"
            rows={8}
            maxRows={8}
            value={'Phone numbers go here'}
            disabled
            id="e2e-sms-numbers"
          />
        </SectionField>
        <SectionField>
          <Label>Message</Label>
          <TextArea
            rows={8}
            maxRows={8}
            value={'This is the message that was sent.'}
            disabled
            id="e2e-sms-message"
          />
        </SectionField>
      </Section>
    </>
  );
};

export default TextCreation;
