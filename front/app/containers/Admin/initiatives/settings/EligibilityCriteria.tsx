import React from 'react';

// components
import {
  SectionField,
  SubSectionTitleWithDescription,
} from 'components/admin/Section';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import { StyledSectionDescription } from '.';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// typings
import { Multiloc, Locale } from 'typings';

interface Props {
  value: Multiloc;
  onChange: (value: Multiloc) => void;
}

export default ({ value, onChange }: Props) => {
  const handleEligibilityCriteriaOnChange = (
    valueMultiloc: Multiloc,
    locale: Locale | undefined
  ) => {
    if (locale) {
      onChange(valueMultiloc);
    }
  };

  return (
    <SectionField>
      <SubSectionTitleWithDescription>
        <FormattedMessage {...messages.proposalEligibilityCriteria} />
      </SubSectionTitleWithDescription>
      <StyledSectionDescription>
        <FormattedMessage {...messages.proposalEligibilityCriteriaInfo} />
      </StyledSectionDescription>
      <QuillMultilocWithLocaleSwitcher
        id="eligibility_criteria"
        valueMultiloc={value}
        onChange={handleEligibilityCriteriaOnChange}
        noImages={true}
        noVideos={true}
        noAlign={true}
        withCTAButton
      />
    </SectionField>
  );
};
