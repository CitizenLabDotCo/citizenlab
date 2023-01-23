import { Box } from '@citizenlab/cl2-component-library';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import { forOwn, size, trim } from 'lodash-es';
import React, { useState } from 'react';
import { WrappedComponentProps } from 'react-intl';
import { ICustomPageAttributes } from 'services/customPages';
import { IHomepageSettingsAttributes } from 'services/homepageSettings';
import { Multiloc } from 'typings';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  bannerHeaderMultiloc:
    | IHomepageSettingsAttributes['banner_signed_out_header_multiloc']
    | ICustomPageAttributes['banner_header_multiloc'];
  bannerSubheaderMultiloc:
    | IHomepageSettingsAttributes['banner_signed_out_subheader_multiloc']
    | ICustomPageAttributes['banner_subheader_multiloc'];
  onHeaderChange: (headerMultiloc: Multiloc) => void;
  onSubheaderChange: (subheaderMultiloc: Multiloc) => void;
  title: string;
  inputLabelText: string;
  subheaderInputLabelText: string;
}

const BannerHeaderFields = ({
  bannerHeaderMultiloc,
  bannerSubheaderMultiloc,
  onHeaderChange,
  onSubheaderChange,
  title,
  inputLabelText,
  subheaderInputLabelText,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const [headerAndSubheaderErrors, setHeaderAndSubheaderErrors] = useState<{
    signedOutHeaderErrors: Multiloc;
    signedOutSubheaderErrors: Multiloc;
  }>({
    signedOutHeaderErrors: {},
    signedOutSubheaderErrors: {},
  });

  const handleOnHeaderChange = (headerMultiloc: Multiloc) => {
    onHeaderChange(headerMultiloc);

    const signedOutHeaderErrors = {};

    forOwn(bannerHeaderMultiloc, (title, locale) => {
      if (size(trim(title)) > 45) {
        signedOutHeaderErrors[locale] = formatMessage(
          messages.titleMaxCharError
        );
      }
    });

    setHeaderAndSubheaderErrors((prevState) => ({
      ...prevState,
      ...signedOutHeaderErrors,
    }));
  };

  const handleSubheaderOnChange = (subheaderMultiloc: Multiloc) => {
    onSubheaderChange(subheaderMultiloc);

    const signedOutSubheaderErrors = {};

    forOwn(bannerSubheaderMultiloc, (title, locale) => {
      if (size(trim(title)) > 45) {
        signedOutSubheaderErrors[locale] = formatMessage(
          messages.titleMaxCharError
        );
      }
    });

    setHeaderAndSubheaderErrors((prevState) => ({
      ...prevState,
      ...signedOutSubheaderErrors,
    }));
  };

  return (
    <>
      <SectionField key={'banner_text'} data-cy="e2e-signed-out-header-section">
        <SubSectionTitle>{title}</SubSectionTitle>
        <InputMultilocWithLocaleSwitcher
          type="text"
          valueMultiloc={bannerHeaderMultiloc}
          label={
            <Box display="flex" mr="20px">
              {inputLabelText}
            </Box>
          }
          maxCharCount={45}
          onChange={handleOnHeaderChange}
          errorMultiloc={headerAndSubheaderErrors.signedOutHeaderErrors}
        />
      </SectionField>
      <SectionField data-cy="e2e-signed-out-subheader-section">
        <InputMultilocWithLocaleSwitcher
          type="text"
          valueMultiloc={bannerSubheaderMultiloc}
          label={subheaderInputLabelText}
          maxCharCount={90}
          onChange={handleSubheaderOnChange}
          errorMultiloc={headerAndSubheaderErrors.signedOutSubheaderErrors}
        />
      </SectionField>
    </>
  );
};

export default injectIntl(BannerHeaderFields);
