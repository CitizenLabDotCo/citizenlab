import React from 'react';

import styled from 'styled-components';
import { Multiloc, SupportedLocale } from 'typings';

import {
  SectionField,
  SubSectionTitleWithDescription,
} from 'components/admin/Section';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import { StyledSectionDescription } from '.';

const StyledSectionField = styled(SectionField)`
  margin-top: 45px;
`;

interface Props {
  value: Multiloc;
  onChange: (value: Multiloc) => void;
}

export default ({ value, onChange }: Props) => {
  const handleThresholdReachedMessageOnChange = (
    valueMultiloc: Multiloc,
    locale: SupportedLocale | undefined
  ) => {
    if (locale) {
      onChange(valueMultiloc);
    }
  };

  return (
    <StyledSectionField>
      <SubSectionTitleWithDescription>
        <FormattedMessage {...messages.proposalSuccessMessage} />
      </SubSectionTitleWithDescription>
      <StyledSectionDescription>
        <FormattedMessage {...messages.proposalSuccessMessageInfo} />
      </StyledSectionDescription>
      <QuillMultilocWithLocaleSwitcher
        id="threshold_reached_message"
        valueMultiloc={value}
        onChange={handleThresholdReachedMessageOnChange}
        noImages={true}
        noVideos={true}
        noAlign={true}
        limitedTextFormatting={true}
        withCTAButton
      />
    </StyledSectionField>
  );
};
