import React, { PureComponent } from 'react';
import { Subscription, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { merge, cloneDeep, forOwn, get, set, size, has, trim, isEmpty, omitBy } from 'lodash-es';

// components
import Label from 'components/UI/Label';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import ColorPickerInput from 'components/UI/ColorPickerInput';
import InputMultiloc from 'components/UI/InputMultiloc';
import { Section, SectionTitle, SectionField, SectionSubtitle, SubSectionTitle } from 'components/admin/Section';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import Warning from 'components/UI/Warning';
import QuillMultiloc from 'components/UI/QuillEditor/QuillMultiloc';
import ErrorMessage from 'components/UI/Error';

// resources
import GetPage, { GetPageChildProps } from 'resources/GetPage';

// style
import styled from 'styled-components';

// utils
import { convertUrlToUploadFileObservable } from 'utils/imageTools';
import getSubmitState from 'utils/getSubmitState';
import { calculateContrastRatio, hexToRgb } from 'utils/styleUtils';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../messages';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, updateTenant, IUpdatedTenantProperties, ITenant, ITenantSettings } from 'services/tenant';
import { updatePage } from 'services/pages';

// typings
import { CLError, UploadFile, Locale, Multiloc } from 'typings';
import InfoTooltip from 'components/admin/InfoTooltip';

const ColorPickerSectionField = styled(SectionField)`
`;

const ContrastWarning = styled(Warning)`
  margin-top: 10px;
`;

const WideSectionField = styled(SectionField)`
  max-width: calc(${(props) => props.theme.maxPageWidth}px - 100px);
`;

interface DataProps {
  homepageInfoPage: GetPageChildProps;
}

interface Props extends DataProps {
  lang: string;
}

interface IAttributesDiff {
  settings?: Partial<ITenantSettings>;
  homepage_info?: Multiloc;
  logo?: UploadFile;
  header_bg?: UploadFile;
}

interface IAttributesDiff {
  settings?: Partial<ITenantSettings>;
  homepage_info?: Multiloc;
  logo?: UploadFile;
  header_bg?: UploadFile;
}

type State = {
  locale: Locale | null;
  attributesDiff: IAttributesDiff;
  currentTenant: ITenant | null;
  logo: UploadFile[] | null;
  header_bg: UploadFile[] | null;
  colorPickerOpened: boolean;
  loading: boolean;
  errors: { [fieldName: string]: CLError[] };
  saved: boolean;
  logoError: string | null;
  headerError: string | null;
  titleError: Multiloc;
  subtitleError: Multiloc;
  contrastRatioWarning: {
    color_main: boolean;
    color_secondary: boolean;
    color_text: boolean;
  };
};

type TenantColors = 'color_main' | 'color_secondary' | 'color_text';

class SettingsCustomizeTab extends PureComponent<Props & InjectedIntlProps, State> {
  titleMaxCharCount: number;
  subtitleMaxCharCount: number;
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      locale: null,
      attributesDiff: {},
      currentTenant: null,
      logo: null,
      header_bg: null,
      colorPickerOpened: false,
      loading: false,
      errors: {},
      saved: false,
      logoError: null,
      headerError: null,
      titleError: {},
      subtitleError: {},
      contrastRatioWarning: {
        color_main: false,
        color_secondary: false,
        color_text: false
      }
    };
    this.titleMaxCharCount = 45;
    this.subtitleMaxCharCount = 90;
    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;

    this.subscriptions = [
      combineLatest(
        locale$,
        currentTenant$
      ).pipe(
        switchMap(([locale, currentTenant]) => {
          const logoUrl = currentTenant.data.attributes.logo.large;
          const headerUrl = currentTenant.data.attributes.header_bg.large;
          const logo$ = (logoUrl ? convertUrlToUploadFileObservable(logoUrl, null, null) : of(null));
          const headerBg$ = (headerUrl ? convertUrlToUploadFileObservable(headerUrl, null, null) : of(null));

          return combineLatest(
            logo$,
            headerBg$,
          ).pipe(
            map(([currentTenantLogo, currentTenantHeaderBg]) => ({
              locale,
              currentTenant,
              currentTenantLogo,
              currentTenantHeaderBg,
            }))
          );
        })
      ).subscribe(({ locale, currentTenant, currentTenantLogo, currentTenantHeaderBg }) => {
        const { attributesDiff } = this.state;
        let logo: UploadFile[] | null = null;
        let header_bg: UploadFile[] | null = null;

        if (currentTenantLogo !== null && !has(attributesDiff, 'logo')) {
          logo = [currentTenantLogo];
        } else if (has(attributesDiff, 'logo')) {
          logo = (attributesDiff.logo && attributesDiff.logo !== null ? [attributesDiff.logo] : null);
        }

        if (currentTenantHeaderBg !== null && !has(attributesDiff, 'header_bg')) {
          header_bg = [currentTenantHeaderBg];
        } else if (has(attributesDiff, 'header_bg')) {
          header_bg = (attributesDiff.header_bg && attributesDiff.header_bg !== null ? [attributesDiff.header_bg] : null);
        }

        this.setState({ locale, currentTenant, logo, header_bg });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subsription => subsription.unsubscribe());
  }

  handleUploadOnAdd = (name: 'logo' | 'header_bg' | 'favicon') => (newImage: UploadFile) => {
    this.setState((state) => ({
      ...state,
      [name]: [newImage],
      attributesDiff: {
        ...(state.attributesDiff || {}),
        [name]: (newImage.base64 as string)
      }
    }));
  }

  handleUploadOnRemove = (name: 'logo' | 'header_bg') => () => {
    this.setState((state) => ({
      ...state,
      [name]: null,
      attributesDiff: {
        ...(state.attributesDiff || {}),
        [name]: null
      }
    }));
  }

  handleTitleOnChange = (titleMultiloc: Multiloc) => {
    this.setState((state) => {
      const { formatMessage } = this.props.intl;
      const titleError = {} as Multiloc;

      forOwn(titleMultiloc, (title, locale) => {
        if (size(trim(title)) > 45) {
          titleError[locale] = formatMessage(messages.titleMaxCharError);
        }
      });

      return {
        titleError,
        attributesDiff: set(cloneDeep(state.attributesDiff), 'settings.core.header_title', titleMultiloc),
      };
    });
  }

  handleSubtitleOnChange = (subtitleMultiloc: Multiloc) => {
    this.setState((state) => {
      const { formatMessage } = this.props.intl;
      const subtitleError = {} as Multiloc;

      forOwn(subtitleMultiloc, (subtitle, locale) => {
        if (size(trim(subtitle)) > 90) {
          subtitleError[locale] = formatMessage(messages.subtitleMaxCharError);
        }
      });

      return {
        subtitleError,
        attributesDiff: set(cloneDeep(state.attributesDiff), 'settings.core.header_slogan', subtitleMultiloc),
      };
    });
  }

  handleColorPickerOnChange = (colorName: TenantColors) => (hexColor: string) => {
    const rgbColor = hexToRgb(hexColor);

    if (rgbColor) {
      this.setState(({ contrastRatioWarning }) => {
        const { r, g, b } = rgbColor;
        const contrastRatio = calculateContrastRatio([255, 255, 255], [r, g, b]);

        return {
          contrastRatioWarning: {
            ...contrastRatioWarning,
            [colorName]: (contrastRatio < 4.50 ? true : false)
          }
        };
      });
    }

    let newDiff = cloneDeep(this.state.attributesDiff);
    newDiff = set(newDiff, `settings.core.${colorName}`, hexColor);
    this.setState({ attributesDiff: newDiff });
  }

  validate = (currentTenant: ITenant, attributesDiff: IAttributesDiff) => {
    const { formatMessage } = this.props.intl;

    const hasRemoteLogo = has(currentTenant, 'data.attributes.logo.large');
    const localLogoIsNotSet = !has(attributesDiff, 'logo');
    const localLogoIsNull = !localLogoIsNotSet && attributesDiff.logo === null;
    const logoError = (!localLogoIsNull || (hasRemoteLogo && localLogoIsNotSet) ? null : formatMessage(messages.noLogo));

    const hasRemoteHeader = has(currentTenant, 'data.attributes.header_bg.large');
    const localHeaderIsNotSet = !has(attributesDiff, 'header_bg');
    const localHeaderIsNull = !localHeaderIsNotSet && attributesDiff.header_bg === null;
    const headerError = (!localHeaderIsNull || (hasRemoteHeader && localHeaderIsNotSet) ? null : formatMessage(messages.noHeader));

    const hasTitleError = !isEmpty(omitBy(this.state.titleError, isEmpty));
    const hasSubtitleError = !isEmpty(omitBy(this.state.subtitleError, isEmpty));

    this.setState({ logoError, headerError });

    return (!logoError && !headerError && !hasTitleError && !hasSubtitleError);
  }

  save = async (event) => {
    event.preventDefault();

    const { currentTenant, attributesDiff } = this.state;
    const { homepageInfoPage } = this.props;
    if (currentTenant && this.validate(currentTenant, attributesDiff)) {
      this.setState({ loading: true, saved: false });
      const homepageInfoPageMultiloc = attributesDiff.homepage_info;

      try {
        await updateTenant(currentTenant.data.id, attributesDiff as IUpdatedTenantProperties);
        if (!isNilOrError(homepageInfoPage)) {
          const homepageInfoPageId = homepageInfoPage.id;
          if (attributesDiff.homepage_info) {
            await updatePage(homepageInfoPageId, { body_multiloc: homepageInfoPageMultiloc });
          }
        }
        this.setState({ loading: false, saved: true, attributesDiff: {} });
      } catch (error) {
        this.setState({ loading: false, errors: error.json.errors });
      }
    }
  }

  handleColorPickerOnClick = () => {
    this.setState({ colorPickerOpened: true });
  }

  handleColorPickerOnClose = () => {
    this.setState({ colorPickerOpened: false });
  }

  handleCustomSectionMultilocOnChange = (homepageInfoPageMultiloc: Multiloc) => {
    this.setState((state) => {
      return {
        attributesDiff: set(cloneDeep(state.attributesDiff), 'homepage_info', homepageInfoPageMultiloc),
      };
    });
  }

  render() {
    const {
      locale,
      currentTenant,
      titleError,
      subtitleError,
      errors,
      contrastRatioWarning,
      saved
    } = this.state;

    const { homepageInfoPage } = this.props;

    if (locale && currentTenant) {
      const { formatMessage } = this.props.intl;
      const { logo, header_bg, attributesDiff, logoError, headerError } = this.state;
      const tenantAttrs = merge(cloneDeep(currentTenant.data.attributes), attributesDiff);
      const homepageInfoPageBodyMultiloc = !isNilOrError(homepageInfoPage) ? { ...homepageInfoPage.attributes.body_multiloc, ...attributesDiff.homepage_info } : { ...attributesDiff.homepage_info };

      return (
        <form onSubmit={this.save}>

          <Section key={'branding'}>
            <SectionTitle>
              <FormattedMessage {...messages.titleCustomize} />
            </SectionTitle>
            <SectionSubtitle>
              <FormattedMessage {...messages.subtitleCustomize} />
            </SectionSubtitle>

            <SubSectionTitle>
              <FormattedMessage {...messages.titleBranding} />
            </SubSectionTitle>

            {['color_main', 'color_secondary', 'color_text'].map((colorName: TenantColors) => (
              <ColorPickerSectionField key={colorName}>
                <Label>
                  <FormattedMessage {...messages[colorName]} />
                </Label>
                <ColorPickerInput
                  type="text"
                  value={get(tenantAttrs, `settings.core.${colorName}`)}
                  onChange={this.handleColorPickerOnChange(colorName)}
                />
                {contrastRatioWarning[colorName] &&
                  <ContrastWarning
                    text={
                      <FormattedMessage
                        {...messages.contrastRatioTooLow}
                      />
                    }
                  />
                }
              </ColorPickerSectionField>
            ))}

            <SectionField key={'logo'}>
              <Label><FormattedMessage {...messages['logo']} /></Label>
              <ImagesDropzone
                acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
                maxNumberOfImages={1}
                maxImageFileSize={5000000}
                images={logo}
                imagePreviewRatio={1}
                maxImagePreviewWidth="150px"
                objectFit="contain"
                onAdd={this.handleUploadOnAdd('logo')}
                onRemove={this.handleUploadOnRemove('logo')}
                placeholder={formatMessage(messages.uploadPlaceholder)}
                errorMessage={logoError}
              />
            </SectionField>
          </Section>

          <Section key={'header'}>
            <SubSectionTitle>
              <FormattedMessage {...messages.header} />
            </SubSectionTitle>

            <SectionField key={'header_bg'}>
              <Label>
                <FormattedMessage {...messages.header_bg} />
                <InfoTooltip {...messages.header_bgTooltip} />
              </Label>
              <ImagesDropzone
                acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
                maxNumberOfImages={1}
                maxImageFileSize={5000000}
                images={header_bg}
                imagePreviewRatio={480 / 1440}
                maxImagePreviewWidth="500px"
                onAdd={this.handleUploadOnAdd('header_bg')}
                onRemove={this.handleUploadOnRemove('header_bg')}
                placeholder={formatMessage(messages.uploadPlaceholder)}
                errorMessage={headerError}
              />
            </SectionField>

            <SectionField>
              <InputMultiloc
                type="text"
                valueMultiloc={get(tenantAttrs, 'settings.core.header_title')}
                label={<FormattedMessage {...messages.headerTitleLabel} />}
                labelTooltip={<InfoTooltip {...messages.headerTitleTooltip} />}
                maxCharCount={this.titleMaxCharCount}
                onChange={this.handleTitleOnChange}
                errorMultiloc={titleError}
              />
            </SectionField>

            <SectionField>
              <InputMultiloc
                type="text"
                valueMultiloc={get(tenantAttrs, 'settings.core.header_slogan')}
                label={<FormattedMessage {...messages.headerSubtitleLabel} />}
                labelTooltip={<InfoTooltip {...messages.headerSubtitleTooltip} />}
                maxCharCount={this.subtitleMaxCharCount}
                onChange={this.handleSubtitleOnChange}
                errorMultiloc={subtitleError}
              />
            </SectionField>
          </Section>

          <Section>
            <SubSectionTitle>
              <FormattedMessage {...messages.homePageCustomSection} />
            </SubSectionTitle>

            <WideSectionField>
              <QuillMultiloc
                id="custom-section"
                inAdmin
                label={<FormattedMessage {...messages.customSectionLabel} />}
                labelTooltip={<InfoTooltip {...messages.customSectionInfo} />}
                valueMultiloc={homepageInfoPageBodyMultiloc}
                onChangeMultiloc={this.handleCustomSectionMultilocOnChange}
              />
              <ErrorMessage fieldName="homepage-info" apiErrors={errors['homepage-info']} />
            </WideSectionField>
          </Section>

          <SubmitWrapper
            loading={this.state.loading}
            status={getSubmitState({ errors, saved, diff: attributesDiff })}
            messages={{
              buttonSave: messages.save,
              buttonSuccess: messages.saveSuccess,
              messageError: messages.saveErrorMessage,
              messageSuccess: messages.saveSuccessMessage,
            }}
          />

        </form>
      );
    }

    return null;
  }
}

const SettingsCustomizeTabWithHOCs = injectIntl<Props>(SettingsCustomizeTab);

export default (inputProps: Props) => (
  <GetPage slug="homepage-info">
    {page => <SettingsCustomizeTabWithHOCs homepageInfoPage={page} {...inputProps} />}
  </GetPage>
);
