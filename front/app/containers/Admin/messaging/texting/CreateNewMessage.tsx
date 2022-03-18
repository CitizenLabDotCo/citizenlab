import React, { useState, useEffect } from 'react';

// components
import TextArea from 'components/UI/TextArea';
// import Error from 'components/UI/Error';
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import { Label, Box, IconTooltip } from '@citizenlab/cl2-component-library';
import { Section, SectionField } from 'components/admin/Section';
import HelmetIntl from 'components/HelmetIntl';

import TextingHeader from './TextingHeader';

// i18n
// import { InjectedIntlProps } from 'react-intl';
// import { FormattedMessage } from 'utils/cl-intl';
// import messages from '../messages';
// import { API_PATH, appLocalePairs } from 'containers/App/constants';
// import { getLocalized } from 'utils/i18n';

// styling
import styled from 'styled-components';

const StyledForm = styled.form`
  width: 500px;
`;

// enough to fit 3 messages
const MAX_CHAR_COUNT = 480;

const TextCreation = () => {
  const [inputPhoneNumbers, setInputPhoneNumbers] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [remainingChars, setRemainingChars] = useState(MAX_CHAR_COUNT);

  const handleInputPhoneNumbersChange = (value) => {
    setInputPhoneNumbers(value);
  };

  const handleInputMessageChange = (value) => {
    setInputMessage(value);
  };

  const handleOnSubmit = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    const remainingCharCount = MAX_CHAR_COUNT - inputMessage.length;
    setRemainingChars(remainingCharCount);
  }, [inputMessage]);

  return (
    <>
      <HelmetIntl
        title={{ id: 'test', defaultMessage: 'Create new SMS' }}
        description={{
          id: 'test',
          defaultMessage: 'Create new SMS description',
        }}
      />
      <Section>
        <SectionField>
          <TextingHeader
            headerMessage="New SMS campaign"
            onClickGoBack={() => {}}
          />
        </SectionField>
        <StyledForm onSubmit={handleOnSubmit}>
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
            />
            <Error text="90 numbers were incorrect: 1-800-900-9999, 1-800-900-9999, 1-800-900-9999, 1-800-900-9999, 1-800-900-9999, 1-800-900-9999, 1-800-900-9999, 1-800-900-9999, " />
          </SectionField>
          <SectionField>
            <Label>
              Message <IconTooltip content="Help goes here" />
            </Label>
            <TextArea
              rows={8}
              maxRows={8}
              value={inputMessage}
              onChange={handleInputMessageChange}
            />
            {remainingChars} characters remaining
          </SectionField>

          <SectionField>
            <Box maxWidth="250px">
              <Button
                buttonStyle="primary"
                size="2"
                type="submit"
                text={'Preview SMS'}
              />
            </Box>
          </SectionField>
        </StyledForm>
      </Section>
    </>
  );
};

export default TextCreation;
