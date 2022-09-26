import { Input, Label } from '@citizenlab/cl2-component-library';
import { SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import React from 'react';
import { InjectedIntlProps } from 'react-intl';
import { CustomizedButtonConfig } from 'services/appConfiguration';
import styled from 'styled-components';
import { Multiloc } from 'typings';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';

const TextSettings = styled.div`
  margin-top: 10px;
  margin-bottom: 15px;
`;

interface Props {
  buttonUrl: string | null;
  buttonMultiloc: Multiloc;
  buttonConfig?: CustomizedButtonConfig;
  handleCTAButtonTextMultilocOnChange: (buttonTextMultiloc: Multiloc) => void;
  handleCTAButtonUrlOnChange: (url: string) => void;
  signInStatus: 'signed_out' | 'signed_in';
  className?: string;
}

const CustomizedButtonSettings = ({
  buttonMultiloc,
  buttonUrl,
  handleCTAButtonTextMultilocOnChange,
  handleCTAButtonUrlOnChange,
  className,
}: Props & InjectedIntlProps) => {
  return (
    <SectionField className={className}>
      <TextSettings>
        <InputMultilocWithLocaleSwitcher
          data-testid="inputMultilocLocaleSwitcher"
          type="text"
          valueMultiloc={buttonMultiloc}
          label={
            <FormattedMessage {...messages.customized_button_text_label} />
          }
          onChange={handleCTAButtonTextMultilocOnChange}
          // we need it null and not {} to make an error disappear after entering a valid value
        />
      </TextSettings>
      <Label>
        <FormattedMessage {...messages.customized_button_url_label} />
      </Label>
      <Input
        data-testid="buttonConfigInput"
        type="text"
        placeholder="https://..."
        onChange={handleCTAButtonUrlOnChange}
        value={buttonUrl}
      />
    </SectionField>
  );
};

export default injectIntl(CustomizedButtonSettings);
