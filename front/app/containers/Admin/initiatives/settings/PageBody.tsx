import React from 'react';

import { pick } from 'lodash-es';
import { Multiloc, SupportedLocale } from 'typings';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';

import {
  SectionFieldPageContent,
  SubSectionTitleWithDescription,
} from 'components/admin/Section';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../messages';

import { StyledSectionDescription } from '.';

interface Props {
  value: Multiloc;
  onChange: (value: Multiloc) => void;
}

export default ({ value, onChange }: Props) => {
  const appConfigurationLocales = useAppConfigurationLocales();
  if (isNilOrError(appConfigurationLocales)) return null;

  const handleBodyOnChange = (
    valueMultiloc: Multiloc,
    locale: SupportedLocale | undefined
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
