import React from 'react';
import styled from 'styled-components';

// components
import {
  Section,
  SectionTitle,
  SectionDescription,
  SectionField,
} from 'components/admin/Section';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import ErrorMessage from 'components/UI/Error';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from './messages';

// typings
import { Multiloc, CLError } from 'typings';

export const WideSectionField = styled(SectionField)`
  max-width: calc(${(props) => props.theme.maxPageWidth}px - 100px);
`;

interface Props {
  homepageInfoMultiloc?: Multiloc;
  homepageInfoErrors: CLError[];
  setParentState: (state: any) => void;
}

const HomepageCustomizableSection = ({
  homepageInfoMultiloc,
  homepageInfoErrors,
  setParentState,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const handleCustomSectionMultilocOnChange = (
    homepageInfoPageMultiloc: Multiloc
  ) => {
    setParentState((state) => ({
      attributesDiff: {
        ...(state.attributesDiff || {}),
        homepage_info_multiloc: homepageInfoPageMultiloc,
      },
    }));
  };

  return (
    <Section key="homepage_customizable_section">
      <SectionTitle>
        <FormattedMessage {...messages.homePageCustomizableSection} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.homePageCustomizableDescription} />
      </SectionDescription>
      <WideSectionField>
        <QuillMultilocWithLocaleSwitcher
          id="custom-section"
          label={formatMessage(messages.customSectionLabel)}
          labelTooltipText={formatMessage(
            messages.homePageCustomizableSectionTooltip
          )}
          valueMultiloc={homepageInfoMultiloc}
          onChange={handleCustomSectionMultilocOnChange}
          withCTAButton
        />
        <ErrorMessage apiErrors={homepageInfoErrors} />
      </WideSectionField>
    </Section>
  );
};

export default injectIntl(HomepageCustomizableSection);
