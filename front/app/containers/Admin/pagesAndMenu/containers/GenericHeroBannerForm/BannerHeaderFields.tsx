import React, { useState } from 'react';
import { SectionField, SubSectionTitle } from 'components/admin/Section';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import { Box, IconTooltip } from '@citizenlab/cl2-component-library';
import { ICustomPageAttributes } from 'services/customPages';
import { IHomepageSettingsAttributes } from 'services/homepageSettings';
import { Multiloc } from 'typings';
import { forOwn, size, trim } from 'lodash-es';
import { InjectedIntlProps } from 'react-intl';
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
  titleMessage: ReactIntl.FormattedMessage.MessageDescriptor;
  inputLabelMessage: ReactIntl.FormattedMessage.MessageDescriptor;
}

const BannerHeaderFields = ({
  bannerHeaderMultiloc,
  bannerSubheaderMultiloc,
  onHeaderChange,
  onSubheaderChange,
  titleMessage,
  inputLabelMessage,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
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
      <SubSectionTitle>
        <FormattedMessage {...messages.header_bg} />
        <IconTooltip
          content={
            <FormattedMessage
              {...messages.headerBgTooltip}
              values={{
                supportPageLink: (
                  <a
                    href={formatMessage(messages.headerImageSupportPageURL)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FormattedMessage
                      {...messages.headerImageSupportPageText}
                    />
                  </a>
                ),
              }}
            />
          }
        />
      </SubSectionTitle>
      <SectionField key={'banner_text'} data-cy="e2e-signed-out-header-section">
        <SubSectionTitle>
          <FormattedMessage {...titleMessage} />
        </SubSectionTitle>
        <InputMultilocWithLocaleSwitcher
          type="text"
          valueMultiloc={bannerHeaderMultiloc}
          label={
            <Box display="flex" mr="20px">
              <FormattedMessage {...inputLabelMessage} />
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
          label={formatMessage(messages.bannerHeaderSignedOutSubtitle)}
          maxCharCount={90}
          onChange={handleSubheaderOnChange}
          errorMultiloc={headerAndSubheaderErrors.signedOutSubheaderErrors}
        />
      </SectionField>
    </>
  );
};

export default injectIntl(BannerHeaderFields);
