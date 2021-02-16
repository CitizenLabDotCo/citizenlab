import React, { PureComponent } from 'react';
import { Subscription, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { forOwn, get, size, has, trim, isEmpty, omitBy } from 'lodash-es';

// components
import { Label, IconTooltip, ColorPickerInput } from 'cl2-component-library';
import ImagesDropzone from 'components/UI/ImagesDropzone';
import RangeInput from 'components/UI/RangeInput';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
import {
  Section,
  SectionTitle,
  SectionField,
  SectionDescription,
  SubSectionTitle,
} from 'components/admin/Section';
import SubmitWrapper from 'components/admin/SubmitWrapper';
import Warning from 'components/UI/Warning';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import ErrorMessage from 'components/UI/Error';

// resources
import GetPage, { GetPageChildProps } from 'resources/GetPage';

// style
import styled, { withTheme } from 'styled-components';

// utils
import { convertUrlToUploadFileObservable } from 'utils/fileTools';
import getSubmitState from 'utils/getSubmitState';
import { calculateContrastRatio, hexToRgb } from 'utils/styleUtils';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../messages';

// services
import { localeStream } from 'services/locale';
import {
  currentAppConfigurationStream,
  updateAppConfiguration,
  IUpdatedAppConfigurationProperties,
  IAppConfiguration,
  IAppConfigurationSettings,
} from 'services/appConfiguration';
import { updatePage } from 'services/pages';

// typings
import { CLError, UploadFile, Locale, Multiloc } from 'typings';

import { isCLErrorJSON } from 'utils/errorUtils';

const ColorPickerSectionField = styled(SectionField)``;

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
  theme: any;
}

interface IAttributesDiff {
  settings?: Partial<IAppConfigurationSettings>;
  homepage_info?: Multiloc;
  logo?: UploadFile;
  header_bg?: UploadFile;
}

interface State {
  locale: Locale | null;
  attributesDiff: IAttributesDiff;
  tenant: IAppConfiguration | null;
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
  contrastRatio: {
    color_main: number | null;
    color_secondary: number | null;
    color_text: number | null;
  };
}

type TenantColors = 'color_main' | 'color_secondary' | 'color_text';

class SettingsCustomizeTab extends PureComponent<
  Props & InjectedIntlProps,
  State
> {
  titleMaxCharCount: number;
  subtitleMaxCharCount: number;
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      locale: null,
      attributesDiff: {},
      tenant: null,
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
        color_text: false,
      },
      contrastRatio: {
        color_main: null,
        color_secondary: null,
        color_text: null,
      },
    };
    this.titleMaxCharCount = 45;
    this.subtitleMaxCharCount = 90;
    this.subscriptions = [];
  }

  componentDidMount() {
    const locale$ = localeStream().observable;
    const tenant$ = currentAppConfigurationStream().observable;

    this.subscriptions = [
      combineLatest(locale$, tenant$)
        .pipe(
          switchMap(([locale, tenant]) => {
            const logoUrl = get(tenant, 'data.attributes.logo.large', null);
            const headerUrl = get(
              tenant,
              'data.attributes.header_bg.large',
              null
            );
            const logo$ = logoUrl
              ? convertUrlToUploadFileObservable(logoUrl, null, null)
              : of(null);
            const headerBg$ = headerUrl
              ? convertUrlToUploadFileObservable(headerUrl, null, null)
              : of(null);

            return combineLatest(logo$, headerBg$).pipe(
              map(([tenantLogo, tenantHeaderBg]) => ({
                locale,
                tenant,
                tenantLogo,
                tenantHeaderBg,
              }))
            );
          })
        )
        .subscribe(({ locale, tenant, tenantLogo, tenantHeaderBg }) => {
          const logo = !isNilOrError(tenantLogo) ? [tenantLogo] : [];
          const header_bg = !isNilOrError(tenantHeaderBg)
            ? [tenantHeaderBg]
            : [];
          this.setState({ locale, tenant, logo, header_bg });
        }),
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach((subsription) => subsription.unsubscribe());
  }

  handleUploadOnAdd = (name: 'logo' | 'header_bg' | 'favicon') => (
    newImage: UploadFile[]
  ) => {
    this.setState((state) => ({
      ...state,
      logoError: name === 'logo' ? null : state.logoError,
      headerError: name === 'header_bg' ? null : state.headerError,
      [name]: [newImage[0]],
      attributesDiff: {
        ...(state.attributesDiff || {}),
        [name]: newImage[0].base64,
      },
    }));
  };

  handleUploadOnRemove = (name: 'logo' | 'header_bg') => () => {
    this.setState((state) => ({
      ...state,
      logoError: name === 'logo' ? null : state.logoError,
      headerError: name === 'header_bg' ? null : state.headerError,
      [name]: null,
      attributesDiff: {
        ...(state.attributesDiff || {}),
        [name]: null,
      },
    }));
  };

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
        attributesDiff: {
          ...state.attributesDiff,
          settings: {
            ...get(state.attributesDiff, 'settings', {}),
            core: {
              ...get(state.attributesDiff, 'settings.core', {}),
              header_title: titleMultiloc,
            },
          },
        },
      };
    });
  };

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
        attributesDiff: {
          ...state.attributesDiff,
          settings: {
            ...get(state.attributesDiff, 'settings', {}),
            core: {
              ...get(state.attributesDiff, 'settings.core', {}),
              header_slogan: subtitleMultiloc,
            },
          },
        },
      };
    });
  };

  handleColorPickerOnChange = (colorName: TenantColors) => (
    hexColor: string
  ) => {
    this.setState((state) => {
      let contrastRatio: number | null = null;
      const rgbColor = hexToRgb(hexColor);

      if (rgbColor) {
        const { r, g, b } = rgbColor;
        contrastRatio = calculateContrastRatio([255, 255, 255], [r, g, b]);
      }

      return {
        contrastRatioWarning: {
          ...state.contrastRatioWarning,
          [colorName]: contrastRatio && contrastRatio < 4.5 ? true : false,
        },
        contrastRatio: {
          ...state.contrastRatio,
          [colorName]: contrastRatio,
        },
        attributesDiff: {
          ...state.attributesDiff,
          settings: {
            ...get(state.attributesDiff, 'settings', {}),
            core: {
              ...get(state.attributesDiff, 'settings.core', {}),
              [colorName]: hexColor,
            },
          },
        },
      };
    });
  };

  handleHeaderOverlayColorOnChange = (hexColor: string) => {
    this.setState((state) => {
      return {
        attributesDiff: {
          ...state.attributesDiff,
          style: {
            ...get(state.attributesDiff, 'style', {}),
            signedOutHeaderOverlayColor: hexColor,
          },
        },
      };
    });
  };

  handleHeaderOverlayOpacityOnChange = (opacity: number) => {
    this.setState((state) => {
      return {
        attributesDiff: {
          ...state.attributesDiff,
          style: {
            ...get(state.attributesDiff, 'style', {}),
            signedOutHeaderOverlayOpacity: opacity,
          },
        },
      };
    });
  };

  validate = (tenant: IAppConfiguration, attributesDiff: IAttributesDiff) => {
    const { formatMessage } = this.props.intl;
    const hasRemoteLogo = has(tenant, 'data.attributes.logo.large');
    const localLogoIsNotSet = !has(attributesDiff, 'logo');
    const localLogoIsNull = !localLogoIsNotSet && attributesDiff.logo === null;
    const logoError =
      !localLogoIsNull || (hasRemoteLogo && localLogoIsNotSet)
        ? null
        : formatMessage(messages.noLogo);
    const hasRemoteHeader = has(tenant, 'data.attributes.header_bg.large');
    const localHeaderIsNotSet = !has(attributesDiff, 'header_bg');
    const localHeaderIsNull =
      !localHeaderIsNotSet && attributesDiff.header_bg === null;
    const headerError =
      !localHeaderIsNull || (hasRemoteHeader && localHeaderIsNotSet)
        ? null
        : formatMessage(messages.noHeader);
    const hasTitleError = !isEmpty(omitBy(this.state.titleError, isEmpty));
    const hasSubtitleError = !isEmpty(
      omitBy(this.state.subtitleError, isEmpty)
    );

    this.setState({ logoError, headerError });

    return !logoError && !headerError && !hasTitleError && !hasSubtitleError;
  };

  save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { tenant, attributesDiff } = this.state;
    const { homepageInfoPage } = this.props;

    if (tenant && this.validate(tenant, attributesDiff)) {
      this.setState({ loading: true, saved: false });
      const homepageInfoPageMultiloc = attributesDiff.homepage_info;

      try {
        await updateAppConfiguration(
          attributesDiff as IUpdatedAppConfigurationProperties
        );

        if (!isNilOrError(homepageInfoPage)) {
          const homepageInfoPageId = homepageInfoPage.id;

          if (attributesDiff.homepage_info) {
            await updatePage(homepageInfoPageId, {
              body_multiloc: homepageInfoPageMultiloc,
            });
          }
        }
        this.setState({ loading: false, saved: true, attributesDiff: {} });
      } catch (error) {
        if (isCLErrorJSON(error)) {
          this.setState({ loading: false, errors: error.json.errors });
        } else {
          this.setState({ loading: false, errors: error });
        }
      }
    }
  };

  handleColorPickerOnClick = () => {
    this.setState({ colorPickerOpened: true });
  };

  handleColorPickerOnClose = () => {
    this.setState({ colorPickerOpened: false });
  };

  handleCustomSectionMultilocOnChange = (
    homepageInfoPageMultiloc: Multiloc
  ) => {
    this.setState((state) => ({
      attributesDiff: {
        ...(state.attributesDiff || {}),
        homepage_info: homepageInfoPageMultiloc,
      },
    }));
  };

  /*
  Below values are intentionally defined outside of render() for better performance
  because references stay the same this way, e.g. onClick={this.handleLogoOnAdd} vs onClick={this.handleUploadOnAdd('logo')},
  and therefore do not trigger unneeded rerenders which would otherwise noticably slow down text input in the form
  */
  handleLogoOnAdd = this.handleUploadOnAdd('logo');
  handleHeaderBgOnAdd = this.handleUploadOnAdd('header_bg');
  handleLogoOnRemove = this.handleUploadOnRemove('logo');
  handleHeaderBgOnRemove = this.handleUploadOnRemove('header_bg');
  headerTitleLabel = (<FormattedMessage {...messages.headerTitleLabel} />);
  headerSubtitleLabel = (
    <FormattedMessage {...messages.headerSubtitleLabel} />
  );
  customSectionLabel = (<FormattedMessage {...messages.customSectionLabel} />);

  render() {
    const { locale, tenant } = this.state;
    const { formatMessage } = this.props.intl;

    if (!isNilOrError(locale) && !isNilOrError(tenant)) {
      const { homepageInfoPage } = this.props;
      const {
        logo,
        header_bg,
        attributesDiff,
        logoError,
        headerError,
        titleError,
        subtitleError,
        errors,
        contrastRatioWarning,
        saved,
        contrastRatio,
      } = this.state;

      return (
        <form onSubmit={this.save}>
          <Section key={'branding'}>
            <SectionTitle>
              <FormattedMessage {...messages.titleCustomize} />
            </SectionTitle>
            <SectionDescription>
              <FormattedMessage {...messages.subtitleCustomize} />
            </SectionDescription>

            <SubSectionTitle>
              <FormattedMessage {...messages.titleBranding} />
            </SubSectionTitle>

            {['color_main', 'color_secondary', 'color_text'].map(
              (colorName: TenantColors) => {
                const contrastRatioOfColor = contrastRatio[colorName];
                const contrastRatioWarningOfColor =
                  contrastRatioWarning[colorName];

                return (
                  <ColorPickerSectionField key={colorName}>
                    <Label>
                      <FormattedMessage {...messages[colorName]} />
                    </Label>
                    <ColorPickerInput
                      type="text"
                      value={
                        get(attributesDiff, `settings.core.${colorName}`) ||
                        get(
                          tenant,
                          `data.attributes.settings.core.${colorName}`
                        )
                      }
                      onChange={this.handleColorPickerOnChange(colorName)}
                    />
                    {contrastRatioWarningOfColor && contrastRatioOfColor && (
                      <ContrastWarning
                        text={
                          <FormattedMessage
                            {...messages.contrastRatioTooLow}
                            values={{
                              wcagLink: (
                                <a
                                  href="https://www.w3.org/TR/WCAG21/"
                                  target="_blank"
                                >
                                  WCAG 2.1 AA
                                </a>
                              ),
                              lineBreak: <br />,
                              contrastRatio: contrastRatioOfColor.toFixed(2),
                            }}
                          />
                        }
                      />
                    )}
                  </ColorPickerSectionField>
                );
              }
            )}

            <ColorPickerSectionField>
              <Label>
                <FormattedMessage {...messages.headerOverlayColor} />
              </Label>
              <ColorPickerInput
                type="text"
                value={
                  get(attributesDiff, 'style.signedOutHeaderOverlayColor') ||
                  get(
                    tenant,
                    'data.attributes.style.signedOutHeaderOverlayColor'
                  ) ||
                  this.props.theme.colorMain
                }
                onChange={this.handleHeaderOverlayColorOnChange}
              />
            </ColorPickerSectionField>

            <SectionField>
              <Label>
                <FormattedMessage {...messages.headerOverlayOpacity} />
              </Label>
              <RangeInput
                step={1}
                min={0}
                max={100}
                value={
                  get(attributesDiff, 'style.signedOutHeaderOverlayOpacity') ||
                  get(
                    tenant,
                    'data.attributes.style.signedOutHeaderOverlayOpacity'
                  ) ||
                  90
                }
                onChange={this.handleHeaderOverlayOpacityOnChange}
              />
            </SectionField>

            <SectionField key={'logo'}>
              <Label htmlFor="tenant-logo-dropzone">
                <FormattedMessage {...messages.logo} />
              </Label>
              <ImagesDropzone
                id="tenant-logo-dropzone"
                acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
                maxNumberOfImages={1}
                maxImageFileSize={5000000}
                images={logo}
                imagePreviewRatio={1}
                maxImagePreviewWidth="150px"
                objectFit="contain"
                onAdd={this.handleLogoOnAdd}
                onRemove={this.handleLogoOnRemove}
                errorMessage={logoError}
              />
            </SectionField>
          </Section>

          <Section key={'header'}>
            <SubSectionTitle>
              <FormattedMessage {...messages.header} />
            </SubSectionTitle>

            <SectionField key={'header_bg'}>
              <Label htmlFor="landingpage-header-dropzone">
                <FormattedMessage {...messages.header_bg} />
                <IconTooltip
                  content={<FormattedMessage {...messages.header_bgTooltip} />}
                />
              </Label>
              <ImagesDropzone
                id="landingpage-header-dropzone"
                acceptedFileTypes="image/jpg, image/jpeg, image/png, image/gif"
                maxNumberOfImages={1}
                maxImageFileSize={5000000}
                images={header_bg}
                imagePreviewRatio={480 / 1440}
                maxImagePreviewWidth="500px"
                onAdd={this.handleHeaderBgOnAdd}
                onRemove={this.handleHeaderBgOnRemove}
                errorMessage={headerError}
              />
            </SectionField>

            <SectionField>
              <InputMultilocWithLocaleSwitcher
                type="text"
                valueMultiloc={
                  get(attributesDiff, 'settings.core.header_title') ||
                  get(tenant, 'data.attributes.settings.core.header_title')
                }
                label={this.headerTitleLabel}
                labelTooltipText={formatMessage(messages.headerTitleTooltip)}
                maxCharCount={this.titleMaxCharCount}
                onChange={this.handleTitleOnChange}
                errorMultiloc={titleError}
              />
            </SectionField>

            <SectionField>
              <InputMultilocWithLocaleSwitcher
                type="text"
                valueMultiloc={
                  get(attributesDiff, 'settings.core.header_slogan') ||
                  get(tenant, 'data.attributes.settings.core.header_slogan')
                }
                label={this.headerSubtitleLabel}
                labelTooltipText={formatMessage(messages.headerSubtitleTooltip)}
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
              <QuillMultilocWithLocaleSwitcher
                id="custom-section"
                label={this.customSectionLabel}
                labelTooltipText={formatMessage(messages.customSectionInfo)}
                valueMultiloc={
                  attributesDiff.homepage_info ||
                  get(homepageInfoPage, 'attributes.body_multiloc')
                }
                onChange={this.handleCustomSectionMultilocOnChange}
                withCTAButton
              />
              <ErrorMessage
                fieldName="homepage-info"
                apiErrors={errors['homepage-info']}
              />
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

const SettingsCustomizeTabWithHOCs = withTheme(
  injectIntl<Props>(SettingsCustomizeTab)
);

export default (inputProps: Props) => (
  <GetPage slug="homepage-info">
    {(page) => (
      <SettingsCustomizeTabWithHOCs homepageInfoPage={page} {...inputProps} />
    )}
  </GetPage>
);
