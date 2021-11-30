import React from 'react';

// components
import {
  SectionField,
  SubSectionTitleWithDescription,
} from 'components/admin/Section';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import { StyledSectionDescription, FieldProps } from '.';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// typings
import { Multiloc, Locale } from 'typings';

export default ({ formValues, setParentState }: FieldProps) => {
  const handleEligibilityCriteriaOnChange = (
    valueMultiloc: Multiloc,
    locale: Locale | undefined
  ) => {
    if (locale) {
      setParentState(({ formValues }) => ({
        formValues: {
          ...formValues,
          eligibility_criteria: valueMultiloc,
        },
      }));
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
        valueMultiloc={formValues.eligibility_criteria}
        onChange={handleEligibilityCriteriaOnChange}
        noImages={true}
        noVideos={true}
        noAlign={true}
        withCTAButton
      />
    </SectionField>
  );
};
