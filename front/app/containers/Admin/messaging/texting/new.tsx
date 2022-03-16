import React, { useState } from 'react';

// components
import TextArea from 'components/UI/TextArea';
// import Error from 'components/UI/Error';
import Button from 'components/UI/Button';

import { Label } from '@citizenlab/cl2-component-library';
import { Section, SectionField } from 'components/admin/Section';
import HelmetIntl from 'components/HelmetIntl';
import SubmitWrapper from 'components/admin/SubmitWrapper';

// i18n
// import { InjectedIntlProps } from 'react-intl';
// import { FormattedMessage } from 'utils/cl-intl';
// import messages from '../messages';
// import { API_PATH, appLocalePairs } from 'containers/App/constants';
// import { getLocalized } from 'utils/i18n';

// styling
import styled from 'styled-components';
// import { colors, fontSizes } from 'utils/styleUtils';
// import { darken } from 'polished';

const TextCreation = () => {
  const [inputPhoneNumbers, setInputPhoneNumbers] = useState('');
  const [inputMessage, setInputMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  const handleInputPhoneNumbersChange = (value) => {
    setInputPhoneNumbers(value);
    console.log(value);
  };

  const handleInputMessageChange = (value) => {
    console.log(value);
    setInputMessage(value);
  };

  const StyledForm = styled.form`
    width: 500px;
  `;

  const HeaderText = styled.h1`
    font-size: 2rem;
  `;

  return (
    <>
      <HelmetIntl
        title={{ id: 'test', defaultMessage: 'Create new SMS' }}
        description={{
          id: 'test',
          defaultMessage: 'Create new SMS description',
        }}
      />
      <StyledForm onSubmit={handleSubmit} id="e2e-text-creation">
        <Section>
          <SectionField>
            <Button buttonStyle="primary-inverse">Go Back</Button>
            <HeaderText>Create a new SMS</HeaderText>
          </SectionField>
          <SectionField>
            <Label>
              Enter a list of phone numbers. Separate each number by a comma and
              include the international dialing code (eg. +1).
            </Label>
            <TextArea
              rows={8}
              maxRows={8}
              value={inputPhoneNumbers}
              onChange={handleInputPhoneNumbersChange}
              id="e2e-sms-numbers"
            />
          </SectionField>

          <SectionField>
            <Label>Message</Label>
            <TextArea
              rows={8}
              maxRows={8}
              value={inputMessage}
              onChange={handleInputMessageChange}
              id="e2e-sms-message"
            />
          </SectionField>

          <SectionField>
            <SubmitWrapper
              loading={false}
              status={'enabled'}
              messages={{
                buttonSave: { id: 'test', defaultMessage: 'Preview SMS' },
                buttonSuccess: { id: 'test', defaultMessage: 'Preview SMS' },
                messageError: { id: 'test', defaultMessage: 'Preview SMS' },
                messageSuccess: { id: 'test', defaultMessage: 'Preview SMS' },
              }}
            />
          </SectionField>
        </Section>
      </StyledForm>
    </>
  );
};

export default TextCreation;
