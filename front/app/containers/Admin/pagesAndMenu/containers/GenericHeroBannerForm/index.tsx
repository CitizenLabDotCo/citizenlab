import React, { useState, ReactElement } from 'react';

// components
import {
  Section,
  SectionField,
  SubSectionTitle,
} from 'components/admin/Section';

import SectionFormWrapper from '../../components/SectionFormWrapper';
import SubmitWrapper, { ISubmitState } from 'components/admin/SubmitWrapper';

import { Box, IconTooltip } from '@citizenlab/cl2-component-library';

import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import BannerImageFields from './BannerImageFields';
// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { Multiloc } from 'typings';
type MultilocErrorType = {
  signedOutHeaderErrors: Multiloc;
  signedOutSubheaderErrors: Multiloc;
};
import { TBreadcrumbs } from 'components/UI/Breadcrumbs';
import { HomepageHeroBannerInputSettings } from 'containers/Admin/pagesAndMenu/EditHomepage/HeroBanner';
import { CustomPageHeroBannerInputSettings } from 'containers/Admin/pagesAndMenu/containers/CustomPages/Edit/HeroBanner';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { forOwn, size, trim } from 'lodash-es';

// constants
import Warning from 'components/UI/Warning';
const TITLE_MAX_CHAR_COUNT = 45;
const SUBTITLE_MAX_CHAR_COUNT = 90;

export interface HeaderImageProps {
  onAddImage: (newImageBase64: string) => void;
  onRemoveImage: () => void;
  onOverlayColorChange: (color: string) => void;
  onOverlayOpacityChange: (color: number) => void;
}

// names differ slightly between HomePage and CustomPage
interface Props extends HeaderImageProps {
  breadcrumbs: TBreadcrumbs;
  title?: string | JSX.Element;
  formStatus: ISubmitState;
  setFormStatus: (submitState: ISubmitState) => void;
  onSave: (inputSettingParameters: HeroBannerInputSettings) => void;
  isLoading: boolean;
  inputSettings: HeroBannerInputSettings;
  outletSectionStart?: ReactElement;
  avatarsFieldComponent?: ReactElement;
  outletSectionEnd?: ReactElement;
  bannerMultilocFieldComponent?: ReactElement;
}

export type HeroBannerInputSettings =
  | HomepageHeroBannerInputSettings
  | CustomPageHeroBannerInputSettings;

const GenericHeroBannerForm = ({
  onSave,
  setFormStatus,
  formStatus,
  isLoading,
  title,
  breadcrumbs,
  intl: { formatMessage },
  outletSectionStart,
  avatarsFieldComponent,
  outletSectionEnd,
  bannerMultilocFieldComponent,
  onAddImage,
  onRemoveImage,
  onOverlayColorChange,
  onOverlayOpacityChange,
}: Props & InjectedIntlProps) => {
  // component state
  const [headerAndSubheaderErrors, setHeaderAndSubheaderErrors] =
    useState<MultilocErrorType>({
      signedOutHeaderErrors: {},
      signedOutSubheaderErrors: {},
    });
  const [localSettings, setLocalSettings] =
    useState<HeroBannerInputSettings | null>(null);

  const updateValueInLocalState = (
    key: keyof HeroBannerInputSettings,
    value: any
  ) => {
    if (localSettings) {
      setLocalSettings({
        ...localSettings,
        [key]: value,
      });
    }

    setFormStatus('enabled');
  };

  const handleHeaderOnChange = (titleMultiloc: Multiloc) => {
    const signedOutHeaderErrors = {};

    forOwn(titleMultiloc, (title, locale) => {
      if (size(trim(title)) > 45) {
        signedOutHeaderErrors[locale] = formatMessage(
          messages.titleMaxCharError
        );
      }
    });

    updateValueInLocalState('banner_header_multiloc', titleMultiloc);
    setHeaderAndSubheaderErrors((prevState) => ({
      ...prevState,
      ...signedOutHeaderErrors,
    }));
  };

  const handleSubheaderOnChange = (subtitleMultiloc: Multiloc) => {
    const signedOutSubheaderErrors = {};

    forOwn(subtitleMultiloc, (subtitle, locale) => {
      if (size(trim(subtitle)) > 90) {
        signedOutSubheaderErrors[locale] = formatMessage(
          messages.subtitleMaxCharError
        );
      }
    });

    updateValueInLocalState('banner_subheader_multiloc', subtitleMultiloc);
    setHeaderAndSubheaderErrors((prevState) => ({
      ...prevState,
      ...signedOutSubheaderErrors,
    }));
  };

  if (isNilOrError(localSettings)) {
    return null;
  }

  return (
    <SectionFormWrapper
      breadcrumbs={breadcrumbs}
      title={title}
      stickyMenuContents={
        <SubmitWrapper
          status={formStatus}
          buttonStyle="primary"
          loading={isLoading}
          onClick={() => onSave(localSettings)}
          messages={{
            buttonSave: messages.heroBannerSaveButton,
            buttonSuccess: messages.heroBannerButtonSuccess,
            messageSuccess: messages.heroBannerMessageSuccess,
            messageError: messages.heroBannerError,
          }}
        />
      }
    >
      <Section key={'header'}>
        <Warning>
          <FormattedMessage {...messages.heroBannerInfoBar} />
        </Warning>
        {outletSectionStart}
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

        <BannerImageFields
          bannerLayout={localSettings.banner_layout}
          bannerOverlayColor={localSettings.banner_overlay_color}
          bannerOverlayOpacity={localSettings.banner_overlay_opacity}
          headerBg={localSettings.header_bg}
          onAddImage={onAddImage}
          onRemoveImage={onRemoveImage}
          setFormStatus={setFormStatus}
          onOverlayColorChange={onOverlayColorChange}
          onOverlayOpacityChange={onOverlayOpacityChange}
        />

        <SectionField
          key={'banner_text'}
          data-cy="e2e-signed-out-header-section"
        >
          <SubSectionTitle>
            <FormattedMessage {...messages.bannerTextTitle} />
          </SubSectionTitle>
          <InputMultilocWithLocaleSwitcher
            type="text"
            valueMultiloc={localSettings.banner_header_multiloc}
            label={
              <Box display="flex" mr="20px">
                <FormattedMessage {...messages.bannerHeaderSignedOut} />
              </Box>
            }
            maxCharCount={TITLE_MAX_CHAR_COUNT}
            onChange={handleHeaderOnChange}
            errorMultiloc={headerAndSubheaderErrors.signedOutHeaderErrors}
          />
        </SectionField>
        <SectionField data-cy="e2e-signed-out-subheader-section">
          <InputMultilocWithLocaleSwitcher
            type="text"
            valueMultiloc={localSettings.banner_subheader_multiloc}
            label={formatMessage(messages.bannerHeaderSignedOutSubtitle)}
            maxCharCount={SUBTITLE_MAX_CHAR_COUNT}
            onChange={handleSubheaderOnChange}
            errorMultiloc={headerAndSubheaderErrors.signedOutSubheaderErrors}
          />
        </SectionField>
        {bannerMultilocFieldComponent}
        {avatarsFieldComponent}
        {outletSectionEnd}
      </Section>
    </SectionFormWrapper>
  );
};

export default injectIntl(GenericHeroBannerForm);
