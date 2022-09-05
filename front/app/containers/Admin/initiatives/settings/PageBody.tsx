import React from 'react';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { pick } from 'lodash-es';

// hooks
import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

// components
import {
  SectionFieldPageContent,
  SubSectionTitleWithDescription,
} from 'components/admin/Section';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import { StyledSectionDescription } from '.';
import Link from 'utils/cl-router/Link';

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
  const appConfigurationLocales = useAppConfigurationLocales();
  if (isNilOrError(appConfigurationLocales)) return null;

  const handleBodyOnChange = (
    valueMultiloc: Multiloc,
    locale: Locale | undefined
  ) => {
    if (locale) {
      onChange(pick(valueMultiloc, appConfigurationLocales));
    }
  };

  return (
    <SectionFieldPageContent>
      <SubSectionTitleWithDescription>
        <FormattedMessage {...messages.proposalsPageBody} />
      </SubSectionTitleWithDescription>
      <StyledSectionDescription>
        <FormattedMessage
          {...messages.proposalsPageBodyInfo}
          values={{
            proposalsPageLink: (
              <Link to={'/pages/initiatives'}>
                <FormattedMessage {...messages.proposalsPageLinkText} />
              </Link>
            ),
          }}
        />
      </StyledSectionDescription>
      <QuillMultilocWithLocaleSwitcher
        id="page_body"
        valueMultiloc={value}
        onChange={handleBodyOnChange}
        withCTAButton
      />
    </SectionFieldPageContent>
  );
};
